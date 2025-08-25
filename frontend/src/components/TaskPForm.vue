<template>
    <div class="modal-backdrop">
      <div class="modal-container">
        <!-- Header del Modal -->
        <div class="modal-header">
          <h2 class="modal-title">
            <i class="fas fa-edit"></i>
            Editar Tarea
          </h2>
          <button type="button" class="btn-close" @click="$emit('cancel')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Contenido Principal -->
        <div class="modal-content">
          <div class="content-layout">
            <!-- Panel de Información -->
            <div class="info-panel">
              <div class="info-card">
                <div class="info-header">
                  <i class="fas fa-info-circle"></i>
                  <h3>Información de la Tarea</h3>
                </div>
                <div class="info-body">
                  <div class="info-item">
                    <div class="info-label">
                      <i class="fas fa-user"></i>
                      Usuario Asignado
                    </div>
                    <div class="info-value">{{ datos.asignado }}</div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-label">
                      <i class="fas fa-project-diagram"></i>
                      Proyecto
                    </div>
                    <div class="info-value">{{ datos.proyecto }}</div>
                  </div>
                  
                  <div class="d-flex justify-content-between">
                    <div class="info-item">
                      <div class="info-label">
                        <i class="fas fa-tasks"></i>
                        Actividad
                      </div>
                      <div class="info-value">{{ datos.actividad }}</div>
                    </div>

                    <div class="info item">
                      <div class="info-label text-center">
                        Avance
                      </div>
                      <div class="progress-container">
                        <div class="progress-bar">
                          <div class="progress-fill" :style="{ width: datos.avance + '%' }"></div>
                        </div>
                        <span class="progress-text">{{ datos.avance }} %</span>
                      </div>
                    </div>
                  </div>
                  
                  
                  <div class="info-item">
                    <div class="info-label">
                      <i class="fas fa-align-left"></i>
                      Descripción
                    </div>
                    <div class="info-value">{{ datos.descripcion }}</div>
                  </div>

                  <div class="d-flex justify-content-between">
                    <div class="info-item">
                      <div class="info-label">
                        <i class="fas fa-clock"></i>
                        Horas Trabajadas
                      </div>
                      <div class="info-value">{{ datos.trabajadas }} hrs</div>
                    </div>

                    <div class="info-item">
                      <div class="info-label">
                        <i class="fas fa-flag"></i>
                        Prioridad
                      </div>
                      <div class="info-value">
                        <span class="priority-badge"
                          :class="{
                            'priority-alta': datos.prioridad.toLowerCase() === 'alta',
                            'priority-media': datos.prioridad.toLowerCase() === 'media',
                            'priority-baja': datos.prioridad.toLowerCase() === 'baja'
                          }">
                          {{ datos.prioridad }}
                        </span>
                      </div>
                    </div>

                    <div class="info-item">
                      <div class="info-label">
                        <i class="fas fa-calendar-alt"></i>
                        Fecha de Fin
                      </div>
                      <div class="info-value">{{ datos.fecha_fin }}</div>
                    </div>

                    

                  </div>

                   <div class="stat-item">
                      <div class="stat-label">Avance</div>
                      <div class="progress-container">
                        <div class="progress-bar">
                          <div class="progress-fill" :style="{ width: datos.avance + '%' }"></div>
                        </div>
                        <span class="progress-text">{{ datos.avance }}%</span>
                      </div>
                    </div>
                </div>
              </div>
            </div>

            <!-- Formulario de Edición -->
            <div class="form-panel">
              <form @submit.prevent="handleSaved" class="edit-form">
                <div class="form-header">
                  <h3>
                    <i class="fas fa-edit"></i>
                    Campos a Modificar
                  </h3>
                  <p>Activa los campos que deseas editar</p>
                </div>

                <!-- Fecha fin -->
                <div class="form-group">
                  <div class="field-header">
                    <div class="field-info">
                      <i class="fas fa-calendar-check"></i>
                      <label class="field-label">Fecha de Fin</label>
                    </div>
                    <div class="toggle-container">
                      <input v-model="selectedFields" value="limited" type="checkbox" 
                             class="toggle-switch" id="toggle-limited">
                      <label for="toggle-limited" class="toggle-label"></label>
                    </div>
                  </div>
                  <input type="date" 
                         class="form-input" 
                         v-model="form.limited" 
                         :disabled="!selectedFields.includes('limited')"
                         :class="{ 'input-disabled': !selectedFields.includes('limited') }">
                </div>

                <!-- Actividad -->
                <div class="form-group">
                  <div class="field-header">
                    <div class="field-info">
                      <i class="fas fa-clipboard-list"></i>
                      <label class="field-label">Actividad</label>
                    </div>
                    <div class="toggle-container">
                      <input v-model="selectedFields" value="activity" type="checkbox" 
                             class="toggle-switch" id="toggle-activity">
                      <label for="toggle-activity" class="toggle-label"></label>
                    </div>
                  </div>
                  <textarea v-model="form.activity" 
                           class="form-input form-textarea" 
                           :class="{ 
                             'is-invalid': errors.activity, 
                             'input-disabled': !selectedFields.includes('activity') 
                           }" 
                           rows="3" 
                           :disabled="!selectedFields.includes('activity')"
                           placeholder="Describe la actividad..."></textarea>
                </div>

                <!-- Prioridad -->
                <div class="form-group">
                  <div class="field-header">
                    <div class="field-info">
                      <i class="fas fa-exclamation-triangle"></i>
                      <label class="field-label">Prioridad</label>
                    </div>
                    <div class="toggle-container">
                      <input v-model="selectedFields" value="priority" type="checkbox" 
                             class="toggle-switch" id="toggle-priority">
                      <label for="toggle-priority" class="toggle-label"></label>
                    </div>
                  </div>
                  <div class="priority-selector" 
                       :class="{ 
                         'is-invalid': errors.priority,
                         'selector-disabled': !selectedFields.includes('priority')
                       }">
                    <div class="priority-option" 
                         :class="{ 
                           'priority-selected': form.priority.toLowerCase() === 'alta',
                           'option-disabled': !selectedFields.includes('priority')
                         }" 
                         @click="updatePriority('alta', 'priority')">
                      <div class="priority-color priority-color-alta"></div>
                      <span>Alta</span>
                      <i class="fas fa-check" v-if="form.priority.toLowerCase() === 'alta'"></i>
                    </div>
                    
                    <div class="priority-option" 
                         :class="{ 
                           'priority-selected': form.priority.toLowerCase() === 'media',
                           'option-disabled': !selectedFields.includes('priority')
                         }" 
                         @click="updatePriority('media', 'priority')">
                      <div class="priority-color priority-color-media"></div>
                      <span>Media</span>
                      <i class="fas fa-check" v-if="form.priority.toLowerCase() === 'media'"></i>
                    </div>
                    
                    <div class="priority-option" 
                         :class="{ 
                           'priority-selected': form.priority.toLowerCase() === 'baja',
                           'option-disabled': !selectedFields.includes('priority')
                         }" 
                         @click="updatePriority('baja', 'priority')">
                      <div class="priority-color priority-color-baja"></div>
                      <span>Baja</span>
                      <i class="fas fa-check" v-if="form.priority.toLowerCase() === 'baja'"></i>
                    </div>
                  </div>
                  <div class="error-message" v-if="errors.priority">{{ errors.priority }}</div>
                </div>

                <!-- Descripción -->
                <div class="form-group">
                  <div class="field-header">
                    <div class="field-info">
                      <i class="fas fa-file-alt"></i>
                      <label class="field-label">Descripción</label>
                    </div>
                    <div class="toggle-container">
                      <input v-model="selectedFields" value="description" type="checkbox" 
                             class="toggle-switch" id="toggle-description">
                      <label for="toggle-description" class="toggle-label"></label>
                    </div>
                  </div>
                  <textarea v-model="form.description" 
                           class="form-input form-textarea" 
                           rows="4" 
                           :class="{ 
                             'is-invalid': errors.description,
                             'input-disabled': !selectedFields.includes('description')
                           }" 
                           :disabled="!selectedFields.includes('description')"
                           placeholder="Descripción detallada de la tarea..."></textarea>
                  <div class="error-message" v-if="errors.description">{{ errors.description }}</div>
                </div>

                <!-- Botones -->
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
                    <i class="fas fa-times"></i>
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { h } from 'vue'
import CustomToast from './CustomToast.vue'

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id
// console.log('Usuario creador:', usuario_creador)

export default {
  name: 'TaskPForm',
  components: {
    CustomToast
  },
  props: {
    initialData: {
      type: Object,
      default: () => ({ 
        id: '', 
        asignado: '', 
        proyecto: '',
        actividad: '',
        descripcion: '',
        trabajadas: '',
        avance: '',
        fecha_fin: '',
        prioridad: ''
      })
    }
  },
  emits: ['saved', 'cancel'],
  data() {
    return {
      form: {
        limited: '',
        activity: '',
        priority: '',
        description: ''
      },
      datos: {
        id: '', 
        asignado: '', 
        proyecto: '',
        actividad: '',
        descripcion: '',
        trabajadas: '',
        avance: '',
        fecha_fin: '',
        prioridad: ''
      },
      selectedFields: [],
      errors: {},
      projects: [],
      users: [],
      loading: false
    }
  },
  mounted() {
    this.datos = { ...this.initialData }
  },
  methods: {
    capitalizePriority(priority) {
      if(!priority) return ''
      return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
    },
    updatePriority(value, field) {
      if (this.selectedFields.includes(field)) {
        this.form.priority = value
      }
    },
    async handleSaved() {
      const toast = useToast();

      if (this.selectedFields.length === 0) {
        toast.warning(
          h(CustomToast, {
            title: 'Sin cambios',
            message: 'Debes seleccionar al menos un campo para actualizar.'
          })
        );
        return;
      }

      // Construir dinámicamente el payload solo con los campos seleccionados
      const taskData = {};
      if (this.selectedFields.includes('limited')) taskData.fecha_limite = this.form.limited;
      if (this.selectedFields.includes('activity')) taskData.actividad = this.form.activity;
      if (this.selectedFields.includes('priority')) taskData.prioridad = this.form.priority;
      if (this.selectedFields.includes('description')) taskData.descripcion = this.form.description;

      try {
        const response = await fetch(`http://localhost:4000/api/tasks/${this.datos.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        
        const result = await response.json()

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 409) {
            toast.error(
              h(CustomToast, {
                title: 'Error',
                message: 'No se pudo actualizar la actividad'
              })
            );
          }
          throw new Error(errorData.error || 'No se pudo actualizar');
        }

        // const updatedTask = await response.json();
        toast.success(
          h(CustomToast, {
            title: 'Tarea actualizada con éxito'
          })
        );

        this.$emit('saved', result.updatedTask);
        this.resetForm();

      } catch (error) {
        toast.warning(
          h(CustomToast, {
            title: 'Algo salió mal',
            message: 'Por favor, intenta de nuevo más tarde'
          })
        );
      }
    },
    resetForm() {
      this.form = {
        user: '',
        project: '',
        activity: '',
        description: '',
        priority: '',
        limited: ''
      };
    }
  }
}
</script>

<style scoped>
/* Importar Font Awesome */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  background: rgb(105, 28, 32);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-content {
  padding: 0;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
}

.content-layout {
  display: flex;
  gap: 0;
  min-height: 500px;
  max-height: calc(90vh - 120px);
}

.info-panel {
  flex: 1;
  background: linear-gradient(135deg, #f1f3f4 0%, #e8eaf6 100%);
  padding: 2rem;
  border-right: 1px solid #e0e6ed;
}

.info-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
}

.info-header {
  background: rgb(188, 149, 92);
  color: white;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.info-body {
  padding: 1.5rem;
}

.info-item {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f2f5;
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.info-value {
  color: #2d3748;
  font-size: 0.95rem;
  line-height: 1.5;
  padding-left: 1.25rem;
}

.info-stats {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f0f2f5;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.stat-value {
  font-weight: 600;
  color: #2d3748;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgb(16, 49, 43), rgb(111, 114, 113));
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(16, 49, 43);
}

.priority-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-alta {
  background: linear-gradient(135deg, rgba(105, 28, 32, 0.2), rgba(105, 28, 32, 0.1));
  color: rgb(105, 28, 32);
  border: 1px solid rgba(105, 28, 32, 0.3);
}

.priority-media {
  background: linear-gradient(135deg, rgba(188, 149, 92, 0.2), rgba(188, 149, 92, 0.1));
  color: rgb(188, 149, 92);
  border: 1px solid rgba(188, 149, 92, 0.3);
}

.priority-baja {
  background: linear-gradient(135deg, rgba(16, 49, 43, 0.2), rgba(16, 49, 43, 0.1));
  color: rgb(16, 49, 43);
  border: 1px solid rgba(16, 49, 43, 0.3);
}

.form-panel {
  flex: 1;
  background: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  margin: 1rem;
}

.edit-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f2f5;
}

.form-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.375rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-header p {
  margin: 0;
  color: #718096;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.field-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.95rem;
  margin: 0;
}

.toggle-container {
  position: relative;
}

.toggle-switch {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  display: inline-block;
  width: 50px;
  height: 24px;
  background: #cbd5e0;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch:checked + .toggle-label {
  background: linear-gradient(135deg, rgb(16, 49, 43), rgb(111, 114, 113));
}

.toggle-switch:checked + .toggle-label::after {
  transform: translateX(26px);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: rgb(16, 49, 43);
  box-shadow: 0 0 0 3px rgba(16, 49, 43, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.input-disabled {
  background: #f7fafc !important;
  color: #a0aec0 !important;
  cursor: not-allowed !important;
}

.priority-selector {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.priority-option {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  position: relative;
  background: white;
  font-size: 0.85rem;
}

.priority-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.priority-selected {
  border-color: rgb(16, 49, 43);
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  color: rgb(16, 49, 43);
}

.option-disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
}

.option-disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

.priority-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.priority-color-alta {
  background: linear-gradient(135deg, rgb(105, 28, 32), rgba(105, 28, 32, 0.8));
}

.priority-color-media {
  background: linear-gradient(135deg, rgb(188, 149, 92), rgba(188, 149, 92, 0.8));
}

.priority-color-baja {
  background: linear-gradient(135deg, rgb(16, 49, 43), rgba(16, 49, 43, 0.8));
}

.selector-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.error-message::before {
  content: '⚠️';
}

.form-actions {
  margin-top: auto;
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f0f2f5;
  flex-shrink: 0;
}

.btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  min-height: 48px;
}

.btn-primary {
  background: linear-gradient(135deg, rgb(16, 49, 43) 0%, rgb(111, 114, 113) 100%);
  color: white;
  flex: 1;
  justify-content: center;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 49, 43, 0.3);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  flex: 0 0 auto;
}

.btn-secondary:hover {
  background: #cbd5e0;
  transform: translateY(-1px);
}

.is-invalid {
  border-color: #e53e3e !important;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1) !important;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-layout {
    flex-direction: column;
  }
  
  .info-panel {
    border-right: none;
    border-bottom: 1px solid #e0e6ed;
  }
  
  .modal-container {
    width: 100%;
    height: 100vh;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .priority-selector {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>