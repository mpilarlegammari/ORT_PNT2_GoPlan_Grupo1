import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import useAuthStore from '../stores/authStore.js'
import { useAuth } from '../composables/useAuth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/acceso',
      redirect: '/login',
      component: () => import('../views/AccesoView.vue'),
      meta: { acceso: true },
      children: [
        {
          path: '/login',
          name: 'login',
          component: () => import('../components/auth/LoginForm.vue'),
        },
        {
          path: '/registro',
          name: 'registro',
          component: () => import('../components/auth/RegistroForm.vue'),
        },
      ],
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/usuario/PerfilView.vue'),
    },
    {
      path: '/mis-reservas',
      name: 'mis-reservas',
      component: () => import('../views/usuario/MisReservas.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/admin/AdminDashboardView.vue'),
      meta: { requiresAdmin: true },
    },
  ],
})
router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) {
    return true
  }

  const auth = useAuthStore()
  const { restoreSession } = useAuth()

  if (!auth.usuario) {
    try {
      await restoreSession()
    } catch {
      return '/login'
    }
  }

  if (!auth.isAuthenticated) {
    return '/login'
  }

  if (!auth.isAdmin) {
    return '/'
  }

  return true
})
export default router
