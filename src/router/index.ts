import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/attendees' },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    { path: '/attendees', name: 'attendees', component: () => import('@/views/AttendeesView.vue'), meta: { title: 'Asistentes' } },
    { path: '/consumptions', name: 'consumptions', component: () => import('@/views/ConsumptionsView.vue'), meta: { title: 'Consumiciones' } },
    { path: '/carta', name: 'carta', component: () => import('@/views/CartaView.vue'), meta: { title: 'Carta' } },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isAuthenticated) return '/login'
  if (to.path === '/login' && auth.isAuthenticated) return '/attendees'
})

export default router
