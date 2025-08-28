<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="bi bi-pencil-square me-2"></i>
          Actualizar Proyecto
        </h2>
        <button class="close-btn me-5 mt-5" @click="$emit('close')">
          ✕
        </button>
      </div>
      
      <div class="modal-body">
        <ActualizarPForm 
          :initialData="initialData" 
          @saved="handleSaved" 
          @cancel="$emit('close')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ActualizarPForm from './ActualizarPForm.vue'

export default {
  components: { ActualizarPForm },
  props: {
    show: Boolean,
    initialData: Object
  },
  methods: {
    handleSaved(proyectData) {
      this.$emit('saved', proyectData)
      this.$emit('close')
    }
  },
  emits: ['saved', 'close'],
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
  position: relative;
}

.modal-header {
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(140deg, rgb(105, 28, 32) 50%, rgb(111, 114, 113) 100%);
  color: white;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  max-height: calc(90vh - 100px);
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 98%;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
}
</style>