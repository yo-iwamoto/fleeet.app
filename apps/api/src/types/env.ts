export interface Env {
  ENVIRONMENT: 'dev' | 'staging' | 'production';
  DB: D1Database;
  TWITTER_CLIENT_ID: string;
  TWITTER_CLIENT_SECRET: string;
  FRONTEND_URL: string;
  API_URL: string;
}
