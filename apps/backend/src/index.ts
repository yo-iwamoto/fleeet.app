import { randomUUID } from 'crypto';
import { env } from './lib/env';
import { functions } from './lib/functions';
import express from 'express';
import { z } from 'zod';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import { firestore } from './lib/firebase';
import { Parse, UserDocRaw } from './types/documents';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/oauth/twitter', (_req, res) => {
  const state = randomUUID();
  res.cookie('twitter_oauth_state', state, { maxAge: 60 * 60 * 1000, secure: true, httpOnly: true });

  const url = new URL('https://twitter.com/i/oauth2/authorize');

  Object.entries({
    response_type: 'code',
    client_id: env.twitter_client_id,
    redirect_uri: env.twitter_redirect_url,
    scope: 'tweet.read offline.access users.read tweet.write',
    state,
    code_challenge: 'challenge',
    code_challenge_method: 'plain',
  }).map(([key, value]) => url.searchParams.append(key, value));

  res.setHeader('Location', url.toString()).status(302).end();
});

const callbackReqQuerySchema = z.object({
  state: z.string(),
  code: z.string(),
});

const callbackReqCookieSchema = z.object({
  twitter_oauth_state: z.string(),
});

app.get('/oauth/twitter/callback', async (req, res) => {
  const cookies = callbackReqCookieSchema.safeParse(req.cookies);
  if (!cookies.success) {
    res.status(400).json({ code: 'no-state-found-on-cookie' });
    return;
  }
  const stateCookie = cookies.data.twitter_oauth_state;

  const queries = callbackReqQuerySchema.safeParse(req.query);
  if (!queries.success) {
    res.status(400).json({ code: 'invalid-queries' });
    return;
  }

  const { state, code } = queries.data;
  if (state !== stateCookie) {
    res.status(400).json({ code: 'incorrect-state' });
    return;
  }

  const body = new URLSearchParams();
  Object.entries({
    code,
    grant_type: 'authorization_code',
    redirect_uri: env.twitter_redirect_url,
    code_verifier: 'challenge',
  }).map(([key, value]) => body.append(key, value));

  const { data: tokenResponseData } = await axios.post<{
    token_type: 'bearer';
    expires_in: number;
    access_token: string;
    scope: string;
    refresh_token: string;
  }>('https://api.twitter.com/2/oauth2/token', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${env.twitter_client_id}:${env.twitter_client_secret}`).toString('base64')}`,
    },
  });

  const {
    data: { data: meResponseData },
  } = await axios.get<{
    data: {
      id: string;
      name: string;
      username: string;
    };
  }>('https://api.twitter.com/2/users/me', {
    headers: {
      Authorization: `Bearer ${tokenResponseData.access_token}`,
    },
  });

  const user = await firestore.collection('users').doc(meResponseData.id).get();
  if (user.exists) {
    await user.ref.update({
      access_token: tokenResponseData.access_token,
      refresh_token: tokenResponseData.refresh_token,
    } satisfies Partial<Parse<UserDocRaw>>);

    res.cookie('session', meResponseData.id, { secure: true, httpOnly: true }).end();
    return;
  }

  await firestore
    .collection('users')
    .doc(meResponseData.id)
    .set({
      twitter_user_id: meResponseData.id,
      twitter_user_name: meResponseData.name,
      twitter_user_username: meResponseData.username,
      access_token: tokenResponseData.access_token,
      refresh_token: tokenResponseData.refresh_token,
      created_at: new Date(),
    } satisfies Parse<UserDocRaw>);

  res.cookie('session', meResponseData.id, { secure: true, httpOnly: true }).end();
});

app.get('/tweets', async (req, res) => {
  const docId = req.cookies.session;
  const doc = await firestore.collection('users').doc(docId).get();
  if (!doc.exists) {
    res.status(400).json({ code: 'invalid-session' });
  }

  const { data } = await axios.get<{
    data: {
      edit_history_tweet_ids: string[];
      id: string;
      text: string;
    }[];
    meta: {
      next_token: string;
      result_count: 10;
      newest_id: string;
      oldest_id: string;
    };
  }>(`https://api.twitter.com/2/users/${docId}/tweets`, {
    headers: {
      Authorization: `Bearer ${doc.data()!.access_token as string}`,
    },
  });

  res.json({
    data,
  });
});

app.get('/delete-tweet/:id', async (req, res) => {
  const docId = req.cookies.session;
  const doc = await firestore.collection('users').doc(docId).get();
  if (!doc.exists) {
    res.status(400).json({ code: 'invalid-session' });
  }

  const tweetId = req.params.id;
  await axios.delete(`https://api.twitter.com/2/tweets/${tweetId}`, {
    headers: {
      Authorization: `Bearer ${doc.data()!.access_token as string}`,
    },
  });
  res.end();
});

export const api = functions.region('asia-northeast1').https.onRequest(app);
