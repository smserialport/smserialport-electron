import { createMemoryHistory, createRouter, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('../views/Home.vue') }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})
