import { Context } from 'hono';
import { CookieOptions } from 'hono/utils/cookie';

export const setCookie = (ctx: Context, name: string, value: string, options?: CookieOptions) => {
  ctx.cookie(name, value, {
    secure: true,
    httpOnly: true,
    path: '/',
    ...options,
  });
};
