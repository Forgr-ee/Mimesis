import { defineStore } from 'pinia'

import { useFirebase } from '../services/firebase'

const { login, logout, getUser } = useFirebase()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userId: '',
    user: {} as null | firebase.default.User,
    loading: true,
    error: null as Error | null,
    initialized: false,
  }),
  actions: {
    async login() {
      this.loading = true
      try {
        this.user = await login()
        this.error = null
        this.loading = false
      } catch (err) {
        this.error = err
        this.loading = false
      }
    },
    async logout() {
      this.loading = true
      try {
        this.user = await logout()
        this.error = null
        this.loading = false
        this.initialized = false
      } catch (err) {
        this.error = err
        this.loading = false
      }
    },
    async authCheck() {
      if (this.initialized) return this.user
      this.loading = true
      try {
        this.user = await getUser()
        if (!this.user) {
          await this.login()
        }
        this.error = null
        this.loading = false
        this.initialized = true
      } catch (err) {
        this.error = err
        this.loading = false
      }
    },
  },
})
