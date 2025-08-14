import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// import { useAuthStore } from '@/stores/auth'


// Extensión de tipos para metadatos de rutas
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    layout?: 'default' | 'admin' | 'auth'
    title?: string
    showSidebar?: boolean
  }
}

const routes: RouteRecordRaw[] = [

  {
    path: '/',
    redirect: 'Login',
  },
  {
    path: '/login',
    name: 'Login',
    component:() => import('@/views/auth/LoginView.vue'),
    meta: {
      requiresAuth: false,
      layout: 'auth',
      showSidebar: false
    }
  },
  {
    path: '/register',
    name: 'Registro',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: {
      requiresAuth: false,
      layout: 'auth',
      showSidebar: false
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/AdminView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'admin',
      title: 'Panel de Administración',
      icon: 'bi-speedometer2',
      showSidebar: true,
    }
  },
  {
    path: '/usuario',
    name: 'Usuarios',
    component: () => import('@/views/UserView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'admin',
      title: 'Panel de Administración',
      icon: 'bi-people-fill',
      showSidebar: true,
    }
  },
  {
    path: '/asignaciones',
    name: 'Asignar Tareas',
    component: () => import('@/views/NewTask.vue'),
    meta: {
      requiresAuth: true,
      layout: 'admin',
      title: 'Panel de Administración',
      icon: 'bi-list-check',
      showSidebar: true,
    }
  },
  {
    path: '/mis-actividades',
    name: 'Mis actividades',
    component: () => import('@/views/MyActivitiesView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'admin',
      title: 'Panel de administración',
      icon: 'bi-ui-checks',
      showSidebar: true
    }
  },
  {
    path: '/proyectos',
    name: 'Agregar Proyectos',
    component: () => import('@/views/ProyectView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'admin',
      title: 'Panel de Administración',
      icon: 'bi-folder-plus',
      showSidebar: true,
    }
  },
  {
    path: '/perfil',
    name: 'Perfi',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      requiresAuth: true,
      showSidebar: false,
      showInSidebar: false,
    }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('@/views/PDFDocument.vue'),
    meta: {
      requiresAuth: true,
      layout: 'admin',
      title: 'Panel de administración',
      icon: 'bi-file-earmark-text',
      showSidebar: true
    }
    
  }


]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

export default router