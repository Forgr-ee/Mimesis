import { toRefs, reactive } from "vue";
import firebase from "firebase/app";
// Required for side-effects
import "firebase/firestore";
import "firebase/auth";

import FIREBASE_CONFIG from "./.env.firebase";

// initialize firebase, this is directly from the firebase documentation
// regarding getting started for the web
if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

// const USERS_COLLECTION_PATH = "users/";

type TState = {
  error: Error | null;
  loading: boolean;
  user: firebase.auth.UserCredential | null | firebase.User;
  userData: any;
  initialized: boolean;
};

const state = reactive<TState>({
  user: null,
  loading: true,
  error: null,
  userData: null,
  initialized: false,
});

export const useAuth = () => {
  const getUserData = async () => {
    const currentUser = firebase.auth().currentUser;
    const resp  = await firebase
      .firestore()
      .collection("users")
      .doc(currentUser?.uid)
      .get();

      if (resp.exists) {
        return {
          ...resp.data(),
          id : currentUser?.uid
         }
      }
  };

  /**
   *
   * @param username
   * @param password
   */
  const login = () => {
    state.loading = true;
    return firebase
      .auth()
      .signInAnonymously()
      .then(
        async (user) => {
          state.error = null;
          state.loading = false;
          state.user = user;
          state.userData = await getUserData();
          return user;
        },
        (error) => {
          state.error = error;
          state.loading = false;
          throw error;
        }
      )
      .catch((error) => {
        console.error('error login', error);
        // Handle Errors here.
        state.error = error;
        state.loading = false;
        throw error;
      });
  };

  /**
   *
   */
  const logout = () => {
    return firebase
      .auth()
      .signOut()
      .then(
        () => {
          state.error = null;
          state.loading = false;
          state.user = null;
          state.userData = null;
        },
        (error) => {
          state.error = error;
          state.loading = false;
        }
      )
      .catch((error) => {
        // Handle Errors here.
        state.error = error;
        state.loading = false;
      });
  };

  // RUN AT STARTUP
  const authCheck = () => {
    return new Promise((resolve, reject) => {
      state.loading = true;
      !state.initialized &&
        firebase.auth().onAuthStateChanged(async (_user) => {
          try {
            if (_user) {
              state.user = _user;
              state.userData = await getUserData();
            } else {
              state.user = await login();
            }
            state.loading = false;
            state.initialized = true;
            resolve(true);
          } catch (err) {
            console.log('err', err);
          }
        });
    });
  };

  return {
    ...toRefs(state),
    // FUNCTIONS
    login,
    logout,
    authCheck,
  };
}