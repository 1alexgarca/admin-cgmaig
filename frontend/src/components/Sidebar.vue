<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true');
const emit = defineEmits(['update:collapsed']);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem('sidebar-collapsed', isCollapsed.value);
  emit('update:collapsed', isCollapsed.value);
};

const mainRoutes = computed(() => {
  return router.options.routes.filter(
    route =>
      route.name &&                      // 👈 Asegura que tenga nombre
      !route.meta?.group &&
      route.meta?.showSidebar !== false &&
      route.meta?.showInSidebar !== false
  );
});

const managementRoutes = computed(() => {
  return router.options.routes.filter(
    route =>
      route.name &&
      route.meta?.group === 'Management' &&
      route.meta?.showSidebar !== false &&
      route.meta?.showInSidebar !== false
  );
});


const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push({ name: 'Login' });
}
</script>

<template>
  <aside
    class="position-fixed top-0 start-0 vh-100 text-white d-flex flex-column shadow-lg"
    :class="{ 'collapsed': isCollapsed }"
  >
    <!-- Encabezado que siempre mide 16rem -->
    <div class="sidebar-header gobPrimary d-flex p-3 align-items-center mb-5">
      <button class="btn btn-sm" @click="toggleCollapse">
        <i class="bi fs-4 text-white" :class="isCollapsed ? 'bi-list' : 'bi-list'"></i>
      </button>
      <img src="@/assets/tabasco.png" alt="Tabasco" style="height: 3.5rem; margin-left: 1.5rem;" class="img-fluid">
    </div>

    <!-- Contenido que colapsa -->
    <div class="sidebar-body d-flex flex-column flex-grow-1 overflow-auto">
      <div class="sidebar-menu p-3 flex-grow-1">
        <div v-for="route in mainRoutes" :key="route.name" class="mb-2">
          <router-link
            :to="route.path"
            class="menu-item d-flex align-items-center text-decoration-none rounded text-black"
            active-class="active gobSecondary fw-bold text-white"
          >
            <i class="bi" :class="route.meta?.icon" style="width: 1.5rem;"></i>
            <!-- <small v-if="!isCollapsed" class="ms-3">{{ route.name }}</small> -->
            <span v-if="!isCollapsed" class="ms-3">{{ route.name }}</span>
          </router-link>
        </div>

        <div v-if="managementRoutes.length" class="menu-group mt-4">
          <div v-if="!isCollapsed" class="group-title text-black small fw-bold mb-2">MANAGEMENT</div>
          <div v-for="route in managementRoutes" :key="route.name" class="mb-2">
            <router-link
              :to="route.path"
              class="menu-item d-flex align-items-center text-decoration-none rounded text-black"
              active-class="active bg-primary fw-bold"
            >
              <i class="bi" :class="route.meta.icon" style="width: 1.5rem;"></i>
              <span v-if="!isCollapsed" class="ms-3 fw-bold">{{ route.name }}</span>
            </router-link>
          </div>
        </div>
      </div>

      <div class="sidebar-footer p-3">
        <router-link
          to="/perfil"
          class="menu-item d-flex align-items-center text-decoration-none rounded text-black mb-3"
          active-class="active gobSecondary fw-bold text-white"
        >
          <i class="bi bi-person-fill" style="width: 1.5rem;"></i>
          <span v-if="!isCollapsed" class="ms-3 fw-bold">Perfil</span>
        </router-link>

        <router-link
          class="menu-item d-flex align-items-center text-decoration-none rounded text-black"  
          to="/login"
          @click.prevent="logout">
            <i class="bi bi-box-arrow-right" style="width: 1.5rem;"></i>
            <span class="fw-bold ms-3" v-if="!isCollapsed">Cerrar Sesión</span>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<style scoped>
aside {
  width: 16rem;
  transition: width 0.3s ease;
}
aside.collapsed {
  width: 4.5rem;
}

.sidebar-header {
  height: 4.5rem;
  min-width: 16rem;
  max-width: 16rem;
  transition: none;
}

.menu-item {
  padding: 0.5rem 0.75rem;
  transition: background 0.2s ease;
}
.menu-item:hover {
  background: rgb(188 149 92);
}

@media (max-width: 768px) {
  aside {
    display: none !important;
  }
}
</style>