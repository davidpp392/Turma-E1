import { getFirebaseConfig } from '@/lib/firebase/config';
import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  const config = getFirebaseConfig();
  if (!config) {
    throw new Error(
      'Firebase não configurado. Defina NEXT_PUBLIC_FIREBASE_* no .env.local. Veja .env.example',
    );
  }
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
