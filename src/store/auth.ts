import firebase from "firebase/app";
// Required for side-effects
import "firebase/firestore";
import { defineStore } from 'pinia'
import "firebase/auth";

import FIREBASE_CONFIG from "./.env.firebase";

if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

const promAuth = (): Promise<firebase.User | null>  => {
  return new Promise<firebase.User | null>((resolve, reject) => {
      firebase.auth().onAuthStateChanged(resolve, reject);
  });
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
      userId: '',
      user: {} as null | firebase.User,
      loading: true,
      error: null as Error | null,
      initialized: false,
  }),
  actions: {
    async login() {
      this.loading = true;
      try {
        await firebase
        .auth()
        .signInAnonymously();
        this.user = firebase.auth().currentUser;
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
        await firebase
        .auth()
        .signOut();
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