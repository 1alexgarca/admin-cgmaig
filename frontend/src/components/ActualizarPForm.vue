<template>
  <div class="form-container">
    <!-- Información actual del proyecto -->
    <div class="info-section">
      <div class="section-header">
        <i class="bi bi-info-circle-fill"></i>
        <h3>Información Actual</h3>
      </div>
      
      <div class="info-cards">
        <div class="info-card">
          <div class="info-label">
            <i class="fas fa-project-diagram"></i>
            Nombre del Proyecto
          </div>
          <div class="info-value">{{ datos.project || 'Sin nombre' }}</div>
        </div>
        
        <div class="info-card">
          <div class="info-label">
            <i class="fas fa-align-left"></i>
            Descripción del Proyecto
          </div>
          <div class="info-value">{{ datos.description || 'Sin descripción' }}</div>
        </div>
      </div>
    </div>

    <!-- Formulario de edición -->
    <div class="edit-section">
      <div class="section-header">
        <i class="bi bi-pencil-square"></i>
        <h3>Datos Actualizados</h3>
      </div>

      <form @submit.prevent="handleSaved" class="edit-form">
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-project-diagram me-2"></i>
            Nombre del Proyecto
          </label>
          <input 
            type="text" 
            class="form-control" 
            v-model="form.project" 
            :placeholder="datos.project || 'Ingrese el nombre del proyecto'"
            required
          >
        </div>

        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-align-left me-2"></i>
            Descripción del Proyecto
          </label>
          <textarea 
            class="form-control" 
            v-model="form.description" 
            :placeholder="datos.description || 'Proporcione una descripción del proyecto'"
            rows="4"
            required
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
            <i class="bi bi-x-circle me-2"></i>
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
            <i class="bi bi-check-circle me-2"></i>
            Actualizar Proyecto
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import { h } from 'vue'
import CustomToast from './CustomToast.vue';

export default {
  name: 'ActualizarPForm',
  components: {
    CustomToast
  },
  props: {
    initialData: {
      type: Object,
      default: () => ({ id: '', project: '', description: '' })
    }
  },
  emits: ['saved', 'cancel'],
  data() {
    return {
      form: {
        id: '',
        project: '',
        description: '',
      },
      datos: {
        id: '',
        project: '',
        description: ''
      }
    }
  },
  computed: {
    isFormValid() {
      return this.form.project.trim().length > 0 && this.form.description.trim().length > 0;
    }
  },
  mounted() {
    this.datos = { ...this.initialData };
    // Pre-llenar el formulario con los datos actuales
    this.form = { ...this.initialData };
  },
  methods: {
    async handleSaved() {
      const toast = useToast()
      try {
        const payload = {
          project: this.form.project.trim(),
          description: this.form.description.trim()
        }
        
        const response = await fetch(`http://localhost:4000/api/project/${this.datos.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 409) {
            toast.error(
              h(CustomToast, {
                title: 'Error',
                message: 'Ya existe un proyecto con ese nombre'
              })
            ) 
          } else {
            toast.error(
              h(CustomToast, {
                title: 'Error',
                message: errorData.error || 'No se pudo actualizar el proyecto'
              })
            )
          }
          return;
        }

        const result = await response.json()
        
        toast.success(
          h(CustomToast, {
            title: '¡Éxito!',
            message: 'El proyecto se actualizó correctamente'
          })
        )
        
        this.$emit('saved', result.updatedProject)
      } catch (error) {
        console.error('Error al actualizar:', error);
        toast.error(
          h(CustomToast, {
            title: 'Error de Conexión',
            message: 'No se pudo conectar con el servidor. Intente de nuevo más tarde.'
          })
        )
      }
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

.form-container {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100%;
}

.info-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  color: #495057;
}

.section-header i {
  font-size: 1.25rem;
  color: rgb(188, 149, 92);
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.info-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid rgb(105, 28, 32);
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.info-label i {
  color: rgb(16, 49, 43w);
}

.info-value {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.edit-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.form-control {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #fff;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control::placeholder {
  color: #adb5bd;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-primary {
  background: rgb(105, 28, 32);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
  }
  
  .edit-section {
    padding: 1.5rem;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>