import { v4 as uuidv4 } from "uuid";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
import { Storage } from "@capacitor/storage";
import { Guess } from '@/hooks/store';

export const randomName = () =>
  uniqueNamesGenerator({
    dictionaries: [animals],
    separator: " ",
  });

  export const randomPlayer = (): Player => ({
  score: 0,
  name: randomName(),
  uuid: uuidv4(),
});

export const randomTeamName = () =>
  uniqueNamesGenerator({
    dictionaries: [colors],
    separator: " ",
  });

export interface Player {
  score: number;
  name: string;
  uuid: string;
}

export interface Team {
  score: number;
  name: string;
  uuid: string;
  players: Player[];
  pastPlayers: string[];
}
export interface PastGuess {
  guess: Guess[];
  pastGuess: string[];
}
export interface Game {
  mode: number;
  teams: Team[];
  pastTeams: string[];
  uuid: string;
  guess?: PastGuess;
}

export const randomTeam = (): Team => ({
  uuid: uuidv4(),
  name: randomTeamName(),
  players: [randomPlayer(), randomPlayer()],
  pastPlayers: [],
  score: 0,
});

export const defaultGame: Game = {
  uuid: uuidv4(),
  mode: 0,
  teams: [randomTeam(), randomTeam()],
  pastTeams: [],
};

export const setStorage = async (key: string, value: any) => {
  await Storage.set({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value),
  });
};

export const getStorage = async (key: string, defaultValue: any = null) => {
  const res = await Storage.get({ key });
  try {
    return res.value ? JSON.parse(res.value) : defaultValue;
  } catch {
    return res.value ? res.value : defaultValue;
  }
};