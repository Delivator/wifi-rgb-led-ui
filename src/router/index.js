import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  name: 'home',
  component: Home,
  meta: {
    title: "Home"
  }
}, {
  path: '/login',
  name: 'login',
  component: () => import('../views/Login.vue'),
  meta: {
    title: "Login"
  }
}, {
  path: '/register',
  name: 'register',
  component: () => import('../views/Register.vue'),
  meta: {
    title: "Register"
  }
}]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router