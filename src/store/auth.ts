import { defineStore } from 'pinia'

import { onAuthStateChanged, signOut, signInAnonymously, User, initializeAuth, browserLocalPersistence } from "firebase/auth";
import { firebaseApp } from '../services/firebase';

// const auth = getAuth(firebaseApp);
const auth = initializeAuth(firebaseApp, {
  persistence: browserLocalPersistence, 
});

const promAuth = (): Promise<User | null>  => {
  return new Promise<User | null>((resolve, reject) => {
      // firebase.auth().onAuthStateChanged(resolve, reject);
      onAuthStateChanged(auth, resolve, reject);
  });
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
      userId: '',
      user: {} as null | User,
      loading: true,
      error: null as Error | null,
      initialized: false,
  }),
  actions: {
    async login() {
      this.loading = true;
      try {
        const userCredential = await signInAnonymously(auth);
        this.user = userCredential.user;
        this.error = null;
        this.loading = false;
      } catch (err) {
        this.error = err;
        this.loading = false;
      }
    },
    async logout ()  {
      this.loading = true;
      try {
        await signOut(auth);
        this.user = null;
        // this.userData= null;
        this.error = null;
        this.loading = false;
        this.initialized = false;
      } catch (err) {
        this.error = err;
        this.loading = false;
      }
    },
    async authCheck() {
      if (this.initialized) return this.user;
      this.loading = true;
      try {
        this.user = await promAuth();
        if (!this.user) {
          await this.login();
        }
        this.error = null;
        this.loading = false;
        this.initialized = true;
      } catch (err) {
        this.error = err;
        this.loading = false;
      }
    },
  }
});