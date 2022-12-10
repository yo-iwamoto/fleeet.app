import { TWITTER_AUTHORIZATION_BASE_URL, TWITTER_TOKEN_BASE_URL } from '@/lib/const';

type TokenResponse = {
  token_type: 'bearer';
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token: string;
};

type TokenReturnValue = {
  accessToken: string;
  refreshToken: string;
};

export const getTwitterAuthorizationUrl = async ({
  state,
  clientId,
  apiUrl,
}: {
  state: string;
  clientId: string;
  apiUrl: string;
}): Promise<string> => {
  const url = new URL(TWITTER_AUTHORIZATION_BASE_URL);

  Object.entries({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: `${apiUrl}/oauth/twitter/callback`,
    scope: 'tweet.read offline.access',
    state,
    code_challenge: 'challenge',
    code_challenge_method: 'plain',
  }).map(([key, value]) => url.searchParams.append(key, value));

  return url.toString();
};

const getBasic = (clientId: string, clientSecret: string) => btoa(`${clientId}:${clientSecret}`);

export const getTokenFromCode = async ({
  code,
  clientId,
  clientSecret,
  apiUrl,
}: {
  code: string;
  clientId: string;
  clientSecret: string;
  apiUrl: string;
}): Promise<TokenReturnValue> => {
  const body = new URLSearchParams();
  Object.entries({
    code,
    grant_type: 'authorization_code',
    redirect_uri: `${apiUrl}/oauth/twitter/callback`,
    code_verifier: 'challenge',
  }).map(([key, value]) => body.append(key, value));

  const res = await fetch(TWITTER_TOKEN_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${getBasic(clientId, clientSecret)}`,
    },
    body,
  }).then((r) => r.json<TokenResponse>());

  return {
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
  };
};

export const getRefreshedToken = async ({
  refreshToken,
  clientId,
  clientSecret,
}: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<TokenReturnValue> => {
  const body = new URLSearchParams();
  Object.entries({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }).map(([key, value]) => body.append(key, value));

  const res = await fetch(TWITTER_TOKEN_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${getBasic(clientId, clientSecret)}`,
    },
    body,
  }).then((r) => r.json<TokenResponse>());

  return {
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
  };
};
