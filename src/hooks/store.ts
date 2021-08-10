import { toRefs, reactive, ref, readonly } from "vue";
import { isPlatform } from "@ionic/vue";
import { RateApp } from "capacitor-rate-app";
import firebase from "firebase/app";
// Required for side-effects
import "firebase/firestore";

import FIREBASE_CONFIG from "./.env.firebase";
import { setStorage, getStorage, Game } from '@/services/game';

// initialize firebase, this is directly from the firebase documentation
// regarding getting started for the web
if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

export type Theme = {
    active: boolean;  
    lang: {
    [key: string]: string;
    };
    icon: string;
    id: string;
    order: number;
    status: string;
};

export type GuessDb = {
    [key: string]: Guess[];
};

export type Guess = {
    title: string;
};

type TState = {
  error: Error | null;
  loading: boolean;
};

type Message = {
  [key: string]: string;
}

type LangMessage = Message & {
  id: string;
  active: boolean;
}


type LangMessages = {
  [key: string]: LangMessage;
}

export const useStore = () => {
  const themes = reactive<Array<Theme>>([]);
  const theme = ref<string>('');
  const guess = reactive<GuessDb>({});
  const offline = ref<boolean>(true);
  const lang = ref<string>('fr');
  const langsMessages = ref<LangMessages>({});
  const state = reactive<TState>({
    // error if one happens
    error: null,
    // if the query is loading or not
    loading: false,
  });

  const needUpdate = async () => {
    const lastUpdate = new Date(await getStorage('lastUpdate', new Date().toISOString()));
    const today = new Date();
    return lastUpdate.getDate() == today.getDate() &&
      lastUpdate.getMonth() == today.getMonth() &&
      lastUpdate.getFullYear() == today.getFullYear()
  }
  /**
  * call this function to get the list of guess in a theme
  */
  const getlangMessages = async () => {
    let values: LangMessages = {};
    if (!await needUpdate()) {
      values = await getStorage('langs') as LangMessages;
    } else {
      try {
        const snapshot = await firebase.firestore().collection('langs')
        .where('active', '==', true).get();
        snapshot.docs.map(doc => {
            const data = doc.data() as LangMessage;
            values[data.id] = data;
        });
        await setStorage('langs', values);
        await setStorage('lastUpdate', new Date().toISOString());
      } catch {
        values = await getStorage('langs') as LangMessages;
        offline.value = true;
      }
    }
    langsMessages.value = values;
    return langsMessages
  };

  /**
  * call this function to get the current theme
  */
   const getTheme = async () => {
    theme.value =  await getStorage(`theme`) as string;
  };

  /**
  * call this function to get the list of guess in a theme
  */
  const getGuess = async (theme: string) => {
    let values: Guess[] = [];
    if (!await needUpdate()) {
      values = await getStorage(`guess_${theme}_${lang.value}`) as Guess[];
    } else {
      try {
        const snapshot = await firebase.firestore().collection(`mode/${theme}/${lang.value}`).get();
        snapshot.docs.map(doc => {
            const data = doc.data() as Guess;
            values.push(data);
        });
        await setStorage(`guess_${theme}_${lang.value}`, values);
      } catch {
        values = await getStorage(`guess_${theme}_${lang.value}`) as Guess[];
      }
    }
    guess[`${theme}_${lang.value}`] = values;
  };

  /**
  * call this function to get the list of themes
  */
  const getThemes = async () => {
    let value: Theme[] = []
    themes.length = 0;
    const listProm: Promise<void>[] = [];
    state.loading = true;
    if (!await needUpdate()) {
      value = (await getStorage('themes')) as Theme[];
    } else {
      try {
        const snapshot = await firebase.firestore().collection('mode')
        .where('active', '==', true)
        .orderBy('order', 'desc').get();
        snapshot.docs.map(doc => {
            const theme = doc.data() as Theme;
            value.push(theme);
            listProm.push(getGuess(theme.id));
        });
        await Promise.all(listProm);
        await setStorage('themes', themes);
        await setStorage('lastUpdate', new Date().toISOString());
      } catch {
        value = await getStorage('themes') as Theme[];
        for (let index = 0; index < themes.length; index++) {
          const theme = themes[index];
          listProm.push(getGuess(theme.id));
        }
        await Promise.all(listProm);
        offline.value = true;
      }
    }
    console.log('themes', value);
    value.forEach((v) => {
      themes.push(v);
    });
    state.loading = false;
    return themes;
  };

  const clearData = (theme: string, lang: string, game: any) => {
    delete game.pastTeams;
    delete game.pastTeams;
    for (let index = 0; index < game.teams.length; index++) {
      delete game.teams[index].pastPlayers;
    }
    return {
        createdAd: new Date().toISOString(),
        theme,
        lang,
        game
    };
  }

  const saveGame = async (userId: string, theme: string, lang: string, game: Game) => {
    const refGames = firebase.firestore().collection(`users/${userId}/games`);
    const refUser = firebase.firestore().collection(`users`).doc(userId);
    await refGames.add(clearData(theme, lang, game));
    const gamesRef = await refGames.get();
    const games = gamesRef.docs.length;
    if (isPlatform("capacitor") && games > 2) {
        RateApp.requestReview();
    }
    await refUser.set({
        games,
    });
  }

  const reload = async () => {
    await getlangMessages();
    await getThemes();
    await getTheme();
  }

  return {
    ...toRefs(state),
    reload,
    themes: readonly(themes),
    theme: readonly(theme),
    offline: readonly(offline),
    lang: readonly(lang),
    langsMessages: readonly(langsMessages),
    guess: guess,
    saveGame,
  };
}