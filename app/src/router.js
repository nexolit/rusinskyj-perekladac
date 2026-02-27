import { createRouter, createWebHistory } from 'vue-router'
import Domov from './pages/Domov.vue'
import Preklad from './pages/Preklad.vue'
import Info from './pages/Info.vue'

const routes = [
  { path: '/', component: Domov },
  { path: '/preklad', component: Preklad },
  { path: '/info', component: Info }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
