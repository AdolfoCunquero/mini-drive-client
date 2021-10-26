import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Main from '../components/Main.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Login },
  { path: '/workspace', component: Main }
]

const router = new VueRouter({
  routes
})

export default router
