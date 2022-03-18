import { describe, expect, test, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../src/store/game'
import { useMainStore } from '../../src/store/main'
import { mockRandom, resetMockRandom } from 'jest-mock-random'
import {
  LangMessages,
  LangMessage,
  Theme,
  GuessDb,
} from '../../src/services/firebase'

const langs: LangMessages = {
  fr: {
    id: 'fr',
    active: true,
    hello: 'bonjour',
  } as unknown as LangMessage,
  en: {
    id: 'en',
    active: true,
    hello: 'hello',
  } as unknown as LangMessage,
}

const gGuess = (title: string) => {
  return { title }
}

const themes: Theme[] = [
  {
    active: true,
    lang: {
      fr: 't1',
      en: 't1',
    },
    icon: 'data',
    id: 't1',
    id_ios: 't1.ios',
    id_android: 't1.android',
    order: 1,
    status: 'paid',
  },
]

const guessDb: GuessDb = {
  t1_fr: [gGuess('1'), gGuess('2'), gGuess('3')],
  t2_fr: [gGuess('10'), gGuess('20'), gGuess('30')],
}

describe('MainStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('need update', () => {
    const main = useMainStore()
    expect(main.needUpdate).toBe(false)
    const yesterday = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24)
    main.lastUpdate = yesterday.toISOString()
    expect(main.needUpdate).toBe(true)
  })

  test('guess order', () => {
    const main = useMainStore()
    main.themes = themes
    main.guessDb = guessDb
    main.langsMessages = langs
    const game = useGameStore()
    game.theme = 't2'
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
    expect(game.pastGuess).toStrictEqual(['10', '20'])
    mockRandom(0.9)
    main.nextGuess()
    expect(main.guess).toStrictEqual('10')
    expect(game.skipGuess).toStrictEqual(['30'])
    expect(game.foundGuess).toStrictEqual(['20'])
    expect(game.pastGuess).toStrictEqual(['30', '20'])
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
})
