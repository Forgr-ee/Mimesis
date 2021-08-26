import { initializeApp } from 'firebase/app';

import FIREBASE_CONFIG from "./.env.firebase";

export const firebaseApp = initializeApp(FIREBASE_CONFIG);