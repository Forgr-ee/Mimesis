import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import HomePage from '../views/Home.vue'
import ThemePage from '../views/Theme.vue'
import GamePage from '../views/Game.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/theme',
    name: 'Theme',
    component: ThemePage,
  },
  {
    path: '/game',
    name: 'Game',
    component: GamePage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
