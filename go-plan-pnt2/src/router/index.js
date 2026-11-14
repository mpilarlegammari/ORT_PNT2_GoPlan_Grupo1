import { createRouter, createWebHistory } from 'vue-router'
import useAuthStore from '../stores/authStore.js'
import { useAuth } from '../composables/useAuth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/login',
    },
    {
      path: '/actividades',
      name: 'actividades',
      component: () => import('../views/actividades/ActividadesView.vue'),
    },
    {
      path: '/actividades/:id',
      name: 'actividad-detalle',
      component: () => import('../views/actividades/ActividadDetalleView.vue'),
      props: true,
    },
    {
      path: '/favoritos',
      name: 'favoritos',
      component: () => import('../views/actividades/FavoritosView.vue'),
    },
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
      path: '/about',
      name: 'about',
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

