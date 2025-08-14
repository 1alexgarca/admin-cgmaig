<template>
    <div class="d-flex">
    <!-- Panel de Información -->
    <div style="margin-right: 2rem; width: 60%;">
      <div class="card bg-secondary-subtle">
        <div class="card-body" style="height: auto;">
          <h6>Usuario Asignado:</h6>
          <p>{{ datos.asignado }}</p>
          <h6>Proyecto</h6>
          <p>{{ datos.proyecto }}</p>
          <h6>Actividad</h6>
          <p>{{ datos.actividad }}</p>
          <h6>Descripción</h6>
          <p>{{ datos.descripcion }}</p>
          <h6>Horas trabajadas</h6>
          <p>{{ datos.trabajadas }}</p>

          <div class="d-flex justify-content-between">
            <div>
              <h6>Avance</h6>
              <p>{{ datos.avance }}%</p>
            </div>
            <div>
              <h6>Fecha de fin</h6>
              <p>{{ datos.fecha_fin }}</p>
            </div>
            <div>
              <h6>Prioridad</h6>
              <span style="height: 20px; width: 60px;" class="badge"
                :class="{
                  'bg-danger': datos.prioridad.toLowerCase() === 'alta',
                  'bg-warning': datos.prioridad.toLowerCase() === 'media',
                  'bg-success': datos.prioridad.toLowerCase() === 'baja'
                }">
                {{ datos.prioridad }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
      <form @submit.prevent="handleSaved" style="width: 50%;">
        <h2 class="fs-3 mb-4">Editar algun campo</h2>
    
        <div class="mb-3">
          <div class="row justify-content-between">
            <div class="col-4">
              <label for="chkLimited" class="form-label">Fecha fin</label>
            </div>
            <div class="col-4 form-check form-switch d-flex justify-content-end">
              <input v-model="selectedFields" value="limited" type="checkbox" role="switch" class="form-check-input">
            </div>
          </div>
          <input type="date" class="form-control" v-model="form.limited" :disabled="!selectedFields.includes('limited')">
        </div>
    
    
    
        <div class="mb-3">
          <div class="row justify-content-between">
            <div class="col-4">
              <label for="chlActivity" class="form-label">Actividad</label>
            </div>
            <div class="col-4 form-check form-switch d-flex justify-content-end">
              <input v-model="selectedFields" value="activity" type="checkbox" role="switch" class="form-check-input">
            </div>
          </div>
          <textarea v-model="form.activity" class="form-control" :class="{ 'is-invalid': errors.activity }" rows="2" :disabled="!selectedFields.includes('activity')"></textarea>
        </div>
    
        
    
        <div class="mb-3">
          <div class="row justify-content-between">
            <div class="col-4">
              <label for="chkPriority" class="form-label">Prioridad</label>
            </div>
            <div class="col-4 form-check form-switch d-flex justify-content-end">
              <input v-model="selectedFields" value="priority" type="checkbox" role="switch" class="form-check-input">
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center gap-2" :class="{ 'is-invalid': errors.priority }">
            <div class="priority-option" :class="{ 'priority-high': form.priority.toLowerCase() === 'alta' }" @click="updatePriority('alta', 'priority')">
              <input v-model="form.priority" type="radio" name="priority" id="priorityHigh" value="alta" class="d-none" :disabled="!selectedFields.includes('priority')">
              <label for="priorityHigh">Alta</label>
            </div>
            
            <div class="priority-option" :class="{ 'priority-medium': form.priority.toLowerCase() === 'media' }" @click="updatePriority('media', 'priority')">
              <input v-model="form.priority" type="radio" name="priority" id="priorityMedium" value="media" class="d-none" :disabled="!selectedFields.includes('priority')">
              <label for="priorityMedium">Media</label>
            </div>
            
            <div class="priority-option" :class="{ 'priority-low': form.priority.toLowerCase() === 'baja' }" @click="updatePriority('baja', 'priority')">
              <input v-model="form.priority" type="radio" name="priority" id="priorityLow" value="baja" class="d-none" :disabled="!selectedFields.includes('priority')">
              <label for="priorityLow">Baja</label>
            </div>
          </div>
          <div class="invalid-feedback d-block" v-if="errors.priority">{{ errors.priority }}</div>
        </div>
        
        <div class="mb-3">
          <div class="row justify-content-between">
            <div class="col-4">
              <label for="chkDescription" class="form-label">Descripción</label>
            </div>
            <div class="col-4 form-check form-switch d-flex justify-content-end">
              <input v-model="selectedFields" value="description" type="checkbox" role="switch" class="form-check-input">
            </div>
          </div>
          <textarea v-model="form.description" class="form-control" rows="3" :class="{ 'is-invalid': errors.description }" :disabled="!selectedFields.includes('description')"></textarea>
          <div class="invalid-feedback" v-if="errors.description">{{ errors.description }}</div>
        </div>
        
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            Guardar
          </button>
        </div>
      </form>

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
    }


,
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
.edit-form-container {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.form-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-label {
  font-weight: 500;
  color: #2a5298;
  margin-bottom: 8px;
  display: block;
}

.form-control {
  border: 1px solid #dee2e6;
  border-radius: 5px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 5px rgba(96, 165, 250, 0.5);
}

.btn-primary {
  background-color: #2a5298;
  border-color: #2a5298;
}

.btn-primary:hover {
  background-color: #1e3c72;
  border-color: #1e3c72;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #5a6268;
}

.invalid-feedback {
  font-size: 0.875rem;
  color: #dc3545;
}

.card.bg-secondary-subtle {
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.card-body h6 {
  color: #2a5298;
  font-weight: 600;
  margin-bottom: 5px;
}

.card-body p {
  margin-bottom: 10px;
  color: #333;
}


.priority-option {
  height: 2.5rem;
  width: 100%;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.priority-option label {
  cursor: pointer;
  margin-bottom: 0;
}

.priority-high {
  background-color: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.3);
  color: #dc3545;
}

.priority-medium {
  background-color: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.priority-low {
  background-color: rgba(25, 135, 84, 0.1);
  border-color: rgba(25, 135, 84, 0.3);
  color: #198754;
}

.priority-option:hover {
  background-color: #f8f9fa;
}
</style>