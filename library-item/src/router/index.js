import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from '@/components/HelloWorld' //@为src目录
import Home from '@/pages/home/Home'
import Login from '@/pages/login/Login'
import Main from '@/pages/main/Main'
import Register from '@/pages/login/Register'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Loginredirect',
      component: Login,
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    }, {
      path: '/login',
      name: 'Login',
      component: Login
    }, {
      path: '/main',
      name: 'Main',
      component: Main
    }, {
      path: '/register',
      name: 'Register',
      component: Register
    }
  ]
})
