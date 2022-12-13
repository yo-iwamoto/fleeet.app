import * as admin from 'firebase-admin';
import { functions } from './functions';

const config = functions.config().backend;

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: config.project_id,
    clientEmail: config.client_email,
    privateKey: config.private_key.replace(/\\n/g, '\n'),
  }),
});

export const firestore = app.firestore();
