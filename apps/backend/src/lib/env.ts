import { functions } from './functions';

const config = functions.config() as {
  backend: {
    twitter_client_id: string;
    twitter_client_secret: string;
    private_key: string;
    project_id: string;
    client_email: string;
    twitter_redirect_url: string;
  };
};

export const env = config.backend;
