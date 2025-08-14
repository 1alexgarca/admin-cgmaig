<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const isUserPanelOpen = ref(false);
const userPanelButton = ref(null);

const toggleUserPanel = () => {
  isUserPanelOpen.value = !isUserPanelOpen.value;
};

const handleClickOutside = (event) => {
  if (userPanelButton.value && !userPanelButton.value.contains(event.target) && !event.target.closest('.user-panel')) {
    isUserPanelOpen.value = false;
  }
};
const isMobileSidebarOpen = ref(false);

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  routeLocationKey.put({ name: 'Login'})
}
</script>

<template>
  <header class="header-improved d-flex justify-content-between align-items-center gobPrimary" 
  style="height: 4.5rem; padding: 0.75rem 1.5rem; z-index: 1100;">
    <!-- Dentro del <header>, reemplaza esta parte -->
    <div class="d-flex align-items-center justify-content-center">
      <!-- Botón de menú visible solo en tablets y celulares -->
      <button
        type="button"
        class="btn d-lg-none me-3"
        @click="toggleMobileSidebar"
      >
        <i class="bi bi-list fs-3 text-black"></i>
      </button>
    </div>

    <!-- Centro: Barra de búsqueda -->
    <div class="d-flex align-items-center flex-grow-1 mx-5">
      <div class="w-100">
        <div class="input-group position-relative">
          <i class="bi bi-search text-muted search-icon"></i>
          <input
            type="search"
            class="form-control rounded-pill border"
            placeholder="Search project"
            aria-label="Search project"
            style="padding-left: 2.75rem; background: rgba(255, 255, 255, 0.9);"
          >
        </div>
      </div>
    </div>

    <!-- Derecha: Íconos de notificación y usuario -->
    <div class="d-flex align-items-center gap-3">
      
      <div class="position-relative">
        <i 
          class="bi bi-bell fs-4 text-black cursor-pointer text-white"
          @click="toggleNotificaciones"
          style="cursor: pointer;">
        </i>
        <span 
          v-if="contadorNoLeidas"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style="font-size: 0.65rem;"
        >
        {{ contadorNoLeidas }}
        </span>
      </div>

      <button ref="userPanelButton" type="button" class="btn p-0" style="color: black;" @click="toggleUserPanel">
        <img
          :src="imagenUrl"
          alt="Foto de perfi1"
          class="rounded-circle"
          style="width: 40px; height: 40px; object-fit: cover;"
        >
      </button>
    </div>

    <!-- Panel de usuario -->
    <div 
      :class="['user-panel', { open: isUserPanelOpen }]"
      class="position-fixed end-0 rounded-5 border bg-white shadow-lg"
      style="top: 70px; width: 25rem; height: 80%; z-index: 1001; transition: transform 0.3s ease-in-out;"
    >
      <div class="mb-4">
        <div class="bg-dark-subtle rounded-top-5" style="height: 10rem;">
          <div class="position-relative d-flex justify-content-center" style="padding-top: 3.5rem;">
            <img 
              :src="imagenUrl"
              alt="Foto de perfil"
              class="position-absolute"
              style="width: 170px; height: 160px; object-fit: cover; border-radius: 15px;"
            >
          </div>
        </div>
      </div>

      <div class="p-3 pt-5" style="height: 100%;">
        <div class="user-info mt-3 mb-4">
          <h6 class="mt-2 mb-1 fs-4 fw-bold">{{ auth.fullName }}</h6>
          <small>{{ auth.dependencia }}</small>
        </div>
        <div class="d-flex mb-3 justify-content-between">
          <router-link to="/perfil" class="btn btn-outline-secondary" style="width: 60%;">
            <i class="bi bi-person"> Perfil</i>
          </router-link>
          <router-link class="btn btn-outline-secondary" to="/login" @click.prevent="logout">
            <i class="bi bi-box-arrow-right"> Cerrar sesión</i>
          </router-link>
        </div>
        <div>
          <table class="table table-borderless">
            <thead>
              <tr>
                <th class="text-muted">
                  <i class="bi bi-envelope-at">
                    <small class="ps-3">Correo</small>
                  </i>
                </th>
                <th class="ps-3 text-muted">
                  <i>{{ auth.email }}</i>
                </th>
              </tr>
              <tr>
                <th class="text-muted">
                  <i class="bi bi-telephone">
                    <small class="ps-3">Teléfono</small>
                  </i>
                </th>
                <th class="ps-3 text-muted">
                  <i>{{ auth.telefono }}</i>
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>


    <!-- Menú lateral móvil -->
    <transition name="slide">
      <aside
        v-if="isMobileSidebarOpen"
        class="position-fixed top-0 start-0 vh-100 bg-body shadow-lg"
        style="width: 16rem; z-index: 1050;"
      >
        <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
          <span class="fw-bold">Menú</span>
          <button class="btn btn-sm" @click="toggleMobileSidebar">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="p-3">
          <div v-for="route in mainRoutes" :key="route.name" class="mb-2">
            <router-link
              :to="route.path"
              class="d-flex align-items-center text-decoration-none text-dark py-2"
              @click="toggleMobileSidebar"
            >
              <i class="bi" :class="route.meta?.icon" style="width: 1.5rem;"></i>
              <span class="ms-3">{{ route.name }}</span>
            </router-link>
          </div>

          <hr />

          <router-link
            to="/settings"
            class="d-flex align-items-center text-decoration-none text-dark py-2"
            @click="toggleMobileSidebar"
          >
            <i class="bi bi-gear" style="width: 1.5rem;"></i>
            <span class="ms-3">Settings</span>
          </router-link>
        </div>
      </aside>
    </transition>

    <!-- Panel de notificaciones -->
    <div 
      v-if="mostrarNotificaciones"
      class="card position-absolute top-100 end-0 mt-2 shadow-lg rounded-4"
      style="width: 400px; z-index: 1000; margin: 1rem; border-color: rgb(105, 28, 32);">
      <div class="card-header d-flex justify-content-between rounded-4" style="background: rgb(105, 28, 32);">
        <div class="fw-bold d-flex align-items-center text-white">
          Notificaciones
        </div>
        <div>
          <ul
            class="nav nav-pills gobTertiary rounded-5 small"
            id="pills-tab"
            role="tablist"
            style="padding-left: 5px; padding-right: 5px; height: 40px;"
          >
            <li class="nav-item d-flex align-items-center container-tooltip" role="presentation" style="height: 40px;">
              <button
                class="nav-link rounded-5 py-1 px-2 small"
                id="pills-home-tab"
                data-bs-toggle="pill"
                active-class="gobPrimary"
                data-bs-target="#pills-home"
                type="button"
                role="tab"
                aria-controls="pills-home"
                aria-selected="true"
                style="font-size: 0.85rem;"
                :class="{ active: pestañaActiva === 'no-leidas' }"
                @click="pestañaActiva = 'no-leidas'"
              >
                <i class="bi bi-envelope"></i>
              </button>
              <span class="tooltip-custom">No leídos</span>
            </li>
            <li class="nav-item d-flex align-items-center container-tooltip" role="presentation" style="height: 40px;">
              <button
                class="nav-link rounded-5 py-1 px-2 small"
                id="pills-profile-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-profile"
                type="button"
                role="tab"
                aria-controls="pills-profile"
                aria-selected="false"
                style="font-size: 0.85rem;"
                :class="pestañaActiva === 'leidas'"
                @click="pestañaActiva = 'leidas'"
              >
                <i class="bi bi-envelope-open"></i>
              </button>
              <span class="tooltip-custom">Leídos</span>
            </li>
          </ul>
        </div>
      </div>

      <div>   
        <div
          v-if="pestañaActiva === 'no-leidas' && notificacionesNoLeidas.length === 0"
          class="text-center row g-0"
        >
          <i class="fs-1 bi bi-bell-slash"></i>
          <small class="fs-5 text-muted fw-semibold">Sin notificaciones</small>
        </div>

        <div v-if="pestañaActiva === 'leidas' && notificacionesLeidas.length === 0" class="text-center row g-0">
          <i class="fs-1 bi bi-bell-slash"></i>
          <small class="fs-5 text-muted fw-semibold">Sin notificaciones leídas</small>
        </div>

        <!-- NO LEÍDAS -->
        <div v-if="pestañaActiva === 'no-leidas'">
          <div 
            v-for="notificacion in notificacionesNoLeidas" 
            :key="notificacion.id_push"
            class="d-flex align-items-start gap-3 p-2 pb-0 border-bottom rounded-bottom-4 notification"
            @click="marcarComoLeida(notificacion.id_push)"
            style="cursor: pointer;"
          >
          
            <div 
              class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
              style="width: 50px; height: 50px; margin-bottom: 5px;"
              :class="[bgClass(notificacion.tipo)]"
            >
              <i 
                class="fs-4"
                :class="[iconClass(notificacion.tipo)]"  
              >
              </i> 
            </div>

            <div class="flex-grow-1">
              <div class="d-flex flex-column">
                <small>
                  <span class="fw-bold">{{ notificacion.nombre_creador }} {{ notificacion.paterno_creador }}</span>
                  {{ notificacion.mensaje }}
                  <span class="fw-bold text-dark">{{ notificacion.actividad }}</span>
                </small>
                <small class="text-muted">
                  <small>{{ notificacion.tiempo }}</small>
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- LEÍDAS -->
        <div v-if="pestañaActiva === 'leidas'">
         <div 
            class="d-flex align-items-start gap-3 p-2 border-bottom rounded-bottom-4"
            v-for="notificacion in notificacionesLeidas"
            :key="notificacion.id_push"  
          >
            <!-- Ícono -->
            <div 
              class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
              style="width: 50px; height: 50px; padding: .8rem;"
              :class="[bgClass(notificacion.tipo)]"
              >
              <i 
                class="bi fs-4"
                :class="[iconClass(notificacion.tipo)]"  >
              </i>
            </div>

            <!-- Contenido de la notificación -->
            <div class="flex-grow-1">
              <div class="d-flex flex-column">
                <small>
                  <span>{{ notificacion.nombre_creador }} {{ notificacion.paterno_creador }}</span>
                  {{ notificacion.mensaje }}
                  <span class="text-dark">{{ notificacion.actividad }}</span>
                </small>
                <small class="text-muted d-flex justify-content-between">
                  <small>{{ notificacion.tiempo }}</small>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>


<script>
import axios from 'axios'
import defaultImage from '@/assets/perfil.webp'
import { routeLocationKey } from 'vue-router';

const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id


export default {
  data() {
    return {
      mostrarNotificaciones: false,
      notificacionesNoLeidas: [],
      notificacionesLeidas: [],
      contadorNoLeidas: 0,
      intervaloNotificaciones: null,
      pestañaActiva: 'no-leidas',
      imagenUrl: '',
      imagen: user.imagen || defaultImage,
    }
  },
  mounted(){
    this.obtenerImagen().then(imagen => {
      if (imagen) {
        this.imagenUrl = `http://localhost:4000${imagen}`
      } else {
          this.imagenUrl = defaultImage
      }
    })

    this.cargarNotificaciones()
    this.intervaloNotificaciones = setInterval(this.cargarNotificaciones, 30000)
  },
  methods: {
    toggleNotificaciones() {
      this.mostrarNotificaciones = !this.mostrarNotificaciones
    },
    async cargarNotificaciones() {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const userId = user?.id  // Asegúrate que sea `id_user` si tu objeto lo tiene así

        const res = await axios.get(`http://localhost:4001/api/notificaciones/${userId}/agrupadas`)
        this.notificacionesNoLeidas = res.data.noLeidas
        this.notificacionesLeidas = res.data.leidas
        this.contadorNoLeidas = res.data.noLeidas.length
      } catch (err) {
        console.error('Error al cargar notificaciones:', err)
      }
    },
    async marcarComoLeida(id_push) {
      try {
        await axios.put(`http://localhost:4001/api/notificaciones/${id_push}/leida`)
        await this.cargarNotificaciones()
      } catch (err) {
        console.error('Error al marcar como leída:', err)
      }
    },
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    },
    iconClass(tipo) {
      switch (tipo?.toLowerCase()) {
        case 'rechazada':
          return 'bi bi-x-circle text-danger'
        case 'ajuste':
          return 'bi bi-pencil'
        case 'vencimiento':
          return 'bi bi-hourglass-split'
      }
    },
    bgClass(tipo) {
      switch (tipo?.toLowerCase()) {
        case 'rechazada':
          return 'bg-danger-subtle'
        case 'ajuste':
          return 'bg-primary-subtle'
        case 'vencimiento':
          return 'bg-warning-subtle'
      }
    },
    async obtenerImagen() {
      try {
        const res = await fetch(`http://localhost:4000/api/usuarios/${userId}/imagen`)
        const data = await res.json()

        if (data.success) {
          return data.imagen
        } else {
            throw new Error(data.error)
        }
      } catch (err) {
          console.error('Error al obtener imagen:', err.message)
          return null
      }
    }
  },
  beforeUnmount() {
    clearInterval(this.intervaloNotificaciones)
  }
}
</script>



<style scoped>
.input-group {
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  z-index: 10;
  pointer-events: none;
}

.form-control.rounded-pill {
  padding-left: 3rem;
  font-size: 1rem;
  color: #333;
  height: 3rem;
}

.form-control.rounded-pill::placeholder {
  color: #6c757d;
}

.user-panel {
  transform: translateX(100%);
}

.user-panel.open {
  transform: translateX(0);
}

.user-panel .menu-items a:hover {
  background-color: #333333;
}

@media (max-width: 991px) {
  .user-panel {
    width: 200px;
  }
}

.header-improved {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

@media (min-width: 992px) {
  .header-improved {
    left: 16rem; /* Ajuste cuando el sidebar está presente */
    width: calc(100% - 16rem);
  }
}

/* Animación deslizante para el aside */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-enter-to {
  transform: translateX(0);
}
.slide-leave-from {
  transform: translateX(0);
}
.slide-leave-to {
  transform: translateX(-100%);
}

.container-tooltip {
  position: relative;
  display: inline-block;
}


.tooltip-custom {
  visibility: hidden;
  background-color: #000;
  color: #fff;
  text-align: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;

    /* posición */
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);

  /* animación */
  opacity: 0;
  transition: opacity 0.3s;
  white-space: nowrap;
  z-index: 100;
}

.container-tooltip:hover .tooltip-custom {
  visibility: visible;
  opacity: 1;
}

.nav-link {
  color: #691c20;
}
.nav-link.active {
  background-color: #691c20;
}

.notification:hover {
  background-color: rgba(188, 149, 92, .3);
}
</style>
