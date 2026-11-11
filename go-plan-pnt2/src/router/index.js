import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/actividades/ActividadesView.vue'),
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
  ],
})

export default router
