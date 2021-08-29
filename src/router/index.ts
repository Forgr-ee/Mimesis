import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import Theme from '../views/Theme.vue'
import Game from '../views/Game.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/theme',
    name: 'Theme',
    component: Theme,
  },
  {
    path: '/game',
    name: 'Game',
    component: Game,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
