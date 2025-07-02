import { createRouter, createWebHistory } from 'vue-router'
import Domov from './pages/Domov.vue'
import Preklad from './pages/Preklad.vue'

const routes = [
  { path: '/', component: Domov },
  { path: '/preklad', component: Preklad }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
