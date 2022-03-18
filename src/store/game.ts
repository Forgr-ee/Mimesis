import { randomSelect } from '~/services/random'
import { isPlatform } from '@ionic/vue'
import { RateApp } from 'capacitor-rate-app'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useMainStore } from './main'
import { v4 as uuidv4 } from 'uuid'
import { Entity, Player, Team, useFirebase } from '../services/firebase'
import faker from '@faker-js/faker'

faker.locale = 'fr'

const { addGame } = useFirebase()

export const randomPlayer = (): Player => ({
  score: 0,
  name: faker.name.firstName(),
  uuid: uuidv4(),
})

export const randomTeamName = (): string => faker.commerce.color()

export const randomTeam = (): Team => ({
  uuid: uuidv4(),
  name: randomTeamName(),
  players: [randomPlayer(), randomPlayer()],
  pastPlayers: [],
  score: 0,
})

// function find by uuid in array
const findByUUID = <Type extends Entity>(
  list: Type[] | undefined,
  uuid: string
): Type | undefined => {
  if (!list) return undefined
  return list.find((item) => item.uuid === uuid)
}

const filterListByUUID = (
  list: Player[] | Team[],
  past: string[]
): Player[] | Team[] => {
  const filtered = list.filter((n) => {
    const index =
      past.findIndex((b) => {
        return b === n.uuid
      }) === -1
    return index
  })
  return filtered
}

export const useGameStore = defineStore('game', {
  state: () => ({
    winned: false,
    loading: true,
    uuid: uuidv4(),
    createdAt: new Date().toISOString(),
    theme: 'improbable',
    teams: [randomTeam(), randomTeam()] as Team[],
    teamUUID: '-1',
    playerUUID: '-1',
    pastTeams: [] as string[],
    skipGuess: [] as string[],
    foundGuess: [] as string[],
  }),
  getters: {
    ready(): boolean {
      return this.teamUUID !== '-1'
    },
    nextTeams(): Team[] {
      if (this.teams.length === this.pastTeams.length) {
        return filterListByUUID(this.teams, [this.teamUUID]) as Team[]
      }
      return filterListByUUID(this.teams, this.pastTeams) as Team[]
    },
    ladder(): Team[] {
      const sorted = this.teams.sort((a: Team, b: Team) => {
        return a.score > b.score ? -1 : 1
      })
      return sorted
    },
    nextPlayers(): Player[] {
      if (!this.team) return []
      if (this.team.players.length === this.team.pastPlayers.length) {
        return filterListByUUID(this.team.players, [
          this.playerUUID,
        ]) as Player[]
      }
      return filterListByUUID(
        this.team.players,
        this.team.pastPlayers
      ) as Player[]
    },
    team(): Team | undefined {
      return findByUUID(this.teams, this.teamUUID)
    },
    player(): Player | undefined {
      return findByUUID(this.team?.players, this.playerUUID)
    },
    pastGuess(): string[] {
      return [...this.skipGuess, ...this.foundGuess]
    },
    teamScore(): number {
      try {
        return this.team ? this.team.score : 0
      } catch (err) {
        return 0
      }
    },
    teamName(): string {
      try {
        return this.team ? this.team.name : ''
      } catch (err) {
        return ''
      }
    },
    mode() {
      const teamLength = this.teams[0].players.length
      let inequal = false
      this.teams.forEach((t: Team) => {
        inequal = inequal || teamLength !== t.players.length ? true : false
      })
      return inequal ? 1 : 0
    },
    playerName(): string {
      try {
        return this.player ? this.player.name : ''
      } catch (err) {
        return ''
      }
    },
  },
  actions: {
    nextPlayer(setLoading = true) {
      if (!this.team) return
      this.loading = setLoading ? true : this.loading
      let plr
      if (this.mode === 1) {
        plr = randomSelect<Player>(this.nextPlayers)
      } else {
        plr = this.nextPlayers.pop() as Player
      }
      this.playerUUID = plr.uuid
      if (this.team.players.length === this.team.pastPlayers.length) {
        this.team.pastPlayers.length = 0
      }
      this.team.pastPlayers.push(plr.uuid)
      this.loading = setLoading ? false : this.loading
    },
    addScore() {
      if (this.team && this.player && this.team.score < 10) {
        this.team.score += 1
        this.player.score++
        if (this.team.score >= 10) {
          this.winned = true
        }
      }
    },
    nextTeam() {
      this.loading = true
      let newTeam: Team
      if (this.mode === 1) {
        newTeam = randomSelect<Team>(this.nextTeams)
      } else {
        newTeam = this.nextTeams.pop() as Team
      }
      this.teamUUID = newTeam.uuid
      if (this.pastTeams.length === this.teams.length) {
        this.pastTeams.length = 0
      }
      this.pastTeams.push(this.teamUUID)
      this.nextPlayer(false)
      this.loading = false
    },
    resetScore() {
      this.teams.forEach((t: Team) => {
        t.score = 0
      })
      this.winned = false
    },
    resetHistory() {
      this.teams.forEach((t: Team) => {
        t.pastPlayers = []
      })
      this.pastTeams = []
      this.skipGuess = []
      this.foundGuess = []
    },
    resetIndex() {
      this.playerUUID = '-1'
      this.teamUUID = '-1'
    },
    reset() {
      this.resetScore()
      this.resetHistory()
      this.resetIndex()
    },
    async save() {
      const authStore = useAuthStore()
      const mainStore = useMainStore()
      if (!authStore.initialized) {
        await authStore.authCheck()
      }
      try {
        const games = await addGame(
          authStore?.user?.uid,
          mainStore.lang,
          this.$state
        )
        if (isPlatform('capacitor') && games > 2) {
          RateApp.requestReview()
        }
      } catch (e) {
        console.error('Error adding document: ', e)
      }
    },
  },
})
