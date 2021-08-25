import { setActivePinia, createPinia } from 'pinia';
import { useGameStore, randomPlayer } from "../../src/store/game";
import { GuessDb, LangMessage, LangMessages, Theme, useMainStore } from "../../src/store/main";
import { mockRandom, resetMockRandom } from 'jest-mock-random';

const langs: LangMessages = {
    fr: {
        id: 'fr',
        active: true,
        hello: "bonjour"
    } as unknown as LangMessage,
    en: {
        id: 'en',
        active: true,
        hello: "hello"
    } as unknown as LangMessage
}

const gGuess = (title: string) => {
    return {title}
}
const themes: Theme[] = [
    {   
        active: true,
        lang: {
            fr: 't1',
            en: 't1'
        },
        icon: 'data',
        id: 't1',
        order: 1,
        status: 'paid'
    }
]

const guessDb: GuessDb = {
    't1_fr': [gGuess('1'), gGuess('2'), gGuess('3')],
    't2_fr': [gGuess('10'), gGuess('20'), gGuess('30')],
}

describe('Test with random usage', () => {
  it('assigns random the values that we want to mock in order', () => {
    mockRandom([0.8, 0.2]);
    const actual = Math.floor(Math.random() * 3); // [0.1, 0.2, 0.1, 0.2]
 
    expect(actual).toEqual(2);
 
    resetMockRandom();
  });
});

describe('MainStore', () => {

    beforeEach(() => {
        setActivePinia(createPinia())
    })


    it('should say need update', () => {
        const main = useMainStore();
        expect(main.needUpdate).toBe(false)
        const yesterday = new Date((new Date()).valueOf() - 1000 * 60 * 60 * 24);
        main.lastUpdate = yesterday.toISOString()
        expect(main.needUpdate).toBe(true)
    })

    it('get random guess from good theme', () => {
        const main = useMainStore();
        main.themes = themes;
        main.guessDb = guessDb;
        main.langsMessages = langs;
        const game = useGameStore();
        game.theme = 't2';
        expect(main.guess).toBe('')
        expect(game.skipGuess).toStrictEqual([])
        expect(game.foundGuess).toStrictEqual([])
        expect(game.pastGuess).toStrictEqual([])
        mockRandom(0.4)
        main.nextGuess()
        expect(main.guess).toBe('20')
        expect(game.skipGuess).toStrictEqual([])
        expect(game.foundGuess).toStrictEqual([])
        expect(game.pastGuess).toStrictEqual([])
        mockRandom(0.9)
        main.nextGuess(true)
        expect(main.guess).toBe('30')
        expect(game.skipGuess).toStrictEqual([])
        expect(game.foundGuess).toStrictEqual(['20'])
        expect(game.pastGuess).toStrictEqual(['20'])
        mockRandom(0.9)
        main.nextGuess()
        expect(main.guess).toStrictEqual('10')
        expect(game.skipGuess).toStrictEqual(['30'])
        expect(game.foundGuess).toStrictEqual(['20'])
        expect(game.pastGuess).toStrictEqual(['30', '20'])
        mockRandom(0.9)
        main.nextGuess()
        expect(main.guess).toStrictEqual('30')
        expect(game.skipGuess).toStrictEqual(['10'])
        expect(game.foundGuess).toStrictEqual(['20'])
        expect(game.pastGuess).toStrictEqual(['10','20'])
        mockRandom(0.9)
        main.nextGuess()
        expect(main.guess).toStrictEqual('10')
        expect(game.skipGuess).toStrictEqual(['30'])
        expect(game.foundGuess).toStrictEqual(['20'])
        expect(game.pastGuess).toStrictEqual(['30','20'])
        mockRandom(0.9)
        main.nextGuess(true)
        expect(game.skipGuess).toStrictEqual([])
        expect(main.guess).toStrictEqual('30')
        expect(game.foundGuess).toStrictEqual(['20', '10'])
        expect(game.pastGuess).toStrictEqual(['20', '10'])
        mockRandom(0.1)
        main.nextGuess(true)
        expect(main.guess).toStrictEqual('Error')
        expect(game.skipGuess).toStrictEqual([])
        expect(game.foundGuess).toStrictEqual(['20', '10', '30'])
        expect(game.pastGuess).toStrictEqual(['20', '10', '30'])
        resetMockRandom()
    })
    it('check game mode', () => {
        const game = useGameStore()
        expect(game.mode).toBe(0)
        game.teams[0].players.push(randomPlayer())
        expect(game.mode).toBe(1)
    })
    it('test score', () => {
        const game = useGameStore()
        game.nextTeam()
        expect(game.winned).toBe(false)
        expect(game.team.score).toBe(0)
        game.addScore()
        expect(game.team.score).toBe(1)
        game.addScore()
        for (let index = 0; index < 9; index++) {
            game.addScore()
        }
        expect(game.team.score).toBe(10)
        expect(game.winned).toBe(true)
        expect(game.ladder[0].uuid).toBe(game.team.uuid)
        game.resetScore()
        expect(game.winned).toBe(false)
        expect(game.team.score).toBe(0)
    })
    it('test randomteam', () => {
        const game = useGameStore()
        expect(game.teamUUID).toBe("-1")
        expect(game.pastTeams).toStrictEqual([])
        mockRandom(0.1)
        game.nextTeam()
        const uid1 = game.teams[1].uuid
        const uid0 = game.teams[0].uuid
        expect(game.teamUUID).toBe(uid1)
        expect(game.pastTeams).toStrictEqual([])
        game.nextTeam()
        expect(game.teamUUID).toBe(uid0)
        expect(game.pastTeams).toStrictEqual([uid1])
        game.nextTeam()
        expect(game.teamUUID).toBe(uid1)
        expect(game.pastTeams).toStrictEqual([uid0])
    })
})