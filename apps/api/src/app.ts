import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { validator } from 'hono/validator';
import { cors } from 'hono/cors';
import { Env } from '@/types/env';
import { getRefreshedToken, getInfoFromCode, getTwitterAuthorizationUrl } from './features/auth';
import { getRandomValue } from './lib/getRandomValue';
import { setCookie } from './lib/cookie';
import { TWITTER_STATE_COOKIE_NAME } from './lib/const';

const app = new Hono<{ Bindings: Env }>();

app.use(logger());
app.use((ctx, next) =>
  cors({
    origin: ctx.env.FRONTEND_URL,
    allowMethods: ['GET', 'POST'],
  })(ctx, next)
);

app.get('/', (ctx) => {
  return ctx.text(ctx.env.ENVIRONMENT);
});

app.get('/oauth/twitter', async (ctx) => {
  const state = getRandomValue();
  setCookie(ctx, TWITTER_STATE_COOKIE_NAME, state, { maxAge: 60 * 60 });
  const redirectUrl = await getTwitterAuthorizationUrl({
    state,
    clientId: ctx.env.TWITTER_CLIENT_ID,
    apiUrl: ctx.env.API_URL,
  });
  return ctx.redirect(redirectUrl);
});

app.get(
  '/oauth/twitter/callback',
  validator(
    (ctx) => ({
      state: ctx.query('state').isRequired(),
      code: ctx.query('code').isRequired(),
    }),
    {
      done: (resultSet, ctx) => {
        if (resultSet.hasError) {
          ctx.status(400);
          return ctx.json({ code: 'invalid-queries' });
        }
      },
    }
  ),
  async (ctx) => {
    const stateCookie = ctx.req.cookie(TWITTER_STATE_COOKIE_NAME);
    if (stateCookie === undefined) {
      ctx.status(400);
      return ctx.json({ code: 'no-state-found-on-cookie' });
    }

    const { state, code } = ctx.req.valid();
    if (stateCookie !== state) {
      ctx.status(400);
      return ctx.json({ code: 'incorrect-state', stateCookie, state });
    }

    const { accessToken, refreshToken, userId, userName } = await getInfoFromCode({
      code,
      clientId: ctx.env.TWITTER_CLIENT_ID,
      clientSecret: ctx.env.TWITTER_CLIENT_SECRET,
      apiUrl: ctx.env.API_URL,
    });

    const result = await ctx.env.DB.prepare(
      `
      SELECT id
      FROM users
      WHERE twitter_user_id = ?
      LIMIT 1;
    `
    )
      .bind(userId)
      .first<{ id: string } | null>();

    const noRecordExistsYet = result === null;

    if (noRecordExistsYet) {
      const appUserId = getRandomValue();
      const { success } = await ctx.env.DB.prepare(
        `
        INSERT INTO users
        (
          id,
          twitter_user_id,
          twitter_user_name,
        )
        VALUES (?, ?, ?)
      `
      )
        .bind(appUserId, userId, userName)
        .run();
      if (!success) {
        ctx.status(500);
        return ctx.json({ code: 'internal' });
      }

      setCookie(ctx, 'user', appUserId);
      return ctx.json({ message: 'ok' });
    } else {
      setCookie(ctx, 'user', result.id);
    }

    return ctx.json({ accessToken, refreshToken });
  }
);

app.get('/hello', async (ctx) => {
  const result = await ctx.env.DB.prepare(
    `
    SELECT id
    FROM users
    LIMIT 1;
  `
  ).first<{ id: string }>();

  return ctx.json({ result });
});

app.get(
  '/refresh',
  validator((ctx) => ({
    refreshToken: ctx.query('token').isRequired(),
  })),
  async (ctx) => {
    const { refreshToken } = ctx.req.valid();
    const { accessToken } = await getRefreshedToken({
      refreshToken,
      clientId: ctx.env.TWITTER_CLIENT_ID,
      clientSecret: ctx.env.TWITTER_CLIENT_SECRET,
    });

    return ctx.json({ accessToken });
  }
);

export default app;
