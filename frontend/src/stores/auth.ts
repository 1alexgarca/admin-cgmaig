import { defineStore } from 'pinia'
import router from '@/router'
import { EmitFlags } from 'typescript'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null') as User | null,
    token: localStorage.getItem('token') || ''
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    fullName: (state) => 
      state.user
        ? `${state.user.name} ${state.user.paterno} ${state.user.materno}`
        : '',

    email: (state) =>
      state.user && state.user.email
        ? state.user.email
        : '',

    telefono: (state) =>
      state.user && state.user.telefono
        ? state.user.telefono
        : '',
    
    imagen: (state) =>
      state.user && state.user.imagen
        ? state.user.imagen
        : '',
    
    dependencia: (state) =>
      state.user && state.user.dependencia
        ? state.user.dependencia
        : ''
  },

  actions: {
    login(userData: User, token: string) {
      this.user = userData
      this.token = token
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', token)
    },

    logout() {
      this.user = null
      this.token = ''
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      router.push('/login')
    }
  }
})

interface User {
  name: string
  paterno: string
  materno: string
  email: string
  telefono: string
  imagen: string
  dependencia: string
}
