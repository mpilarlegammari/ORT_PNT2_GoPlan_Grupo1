import { createRouter, createWebHistory } from 'vue-router'
import { validarAcceso } from './guards.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin/reservas',
      name: 'admin-reservas',
      component: () => import('../views/admin/AdminReservasView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/actividades/:id/editar',
      name: 'actividad-editar',
      component: () => import('../views/admin/ActividadFormView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/actividades/nueva',
      name: 'actividad-crear',
      component: () => import('../views/admin/ActividadCrearView.vue'),
      meta: { requiresAdmin: true },
    },
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
      meta: { requiresUser: true },
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
      meta: { requiresUser: true },
      component: () => import('../views/usuario/MisReservas.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/admin/actividades',
      name: 'admin-actividades',
      component: () => import('../views/admin/AdminActividadesView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/admin/AdminDashboardView.vue'),
      meta: { requiresAdmin: true },
    },
  ],
})
router.beforeEach(validarAcceso)
export default router
