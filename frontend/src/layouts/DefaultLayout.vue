<template>
  <div id="app">
    <app-header @update:sidebar-open="handleSidebarToggle" />
    <div class="app-container">
        <sidebar :is-open="isSidebarOpen" @update:collapsed="handleSidebarCollapse" />
        <main
          class="main-content"
          :style="{
            marginLeft: isSidebarCollapsed ? '4.5rem' : '16rem',
            marginTop: '3rem',
            transition: 'margin-left 0.3s ease'
          }"
          >
          <slot /> 
        </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import AppHeader from '@/components/Header.vue';

const isSidebarCollapsed = ref(false);
const isSidebarOpen = ref(true);

const handleSidebarCollapse = (collapsed) => {
  isSidebarCollapsed.value = collapsed;
};

const handleSidebarToggle = (value) => {
  isSidebarOpen.value = value;
};

</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  /* padding: 20px; */
  /* background-color: #f5f5f5; */
  transition: margin-left 0.3s ease;
}

@media (max-width: 992px) {
  .main-content {
    padding: 20px 10px;
  }

  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
