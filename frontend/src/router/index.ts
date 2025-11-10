import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@views/LoginView.vue'
import RegisterView from '@views/RegisterView.vue'
import HomeView from '@views/HomeView.vue'
import MovieDetailView from '@views/MovieDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/detail',
      name: 'detail',
      component: MovieDetailView,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next({ name: 'login', replace: true })
  }
  else if ((to.name === 'login' || to.name === 'register') && token) {
    next({ name: 'home', replace: true })
  }
  else {
    next()
  }
})

export default router
