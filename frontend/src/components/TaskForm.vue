<template>
  <form @submit.prevent="handleSubmit">
    <h2 class="fs-3 mb-4">Asigna una actividad</h2>

    <div class="mb-3">
      <label class="form-label">Asignar</label>
      <select v-model="form.user" :class="['form-select', errors.user && 'is-invalid']">
        <option disabled value="">-- Asignar --</option>
        <option v-for="user in users" :key="user.id_user" :value="user.id_user">
          {{ user.nombre }} {{ user.paterno }} {{ user.materno }}
        </option>
      </select>
      <div v-if="errors.user" class="invalid-feedback">{{ errors.user }}</div>

    </div>


     <div class="row justify-content-between">
        <div class="mb-3 col-6">
          <label class="form-label">Proyecto</label>
          <select v-model="form.project" :class="['form-select', errors.project && 'is-invalid']">
            <option value="" disabled selected>-- Seleccione el proyecto --</option>
            <option v-for="project in projects" :key="project.id_project" :value="project.id_project">
              {{ project.name_project }}
            </option>
          </select>
          <div v-if="errors.project" class="invalid-feedback">{{ errors.project }}</div>
        </div>

        <div class="mb-3 col-6">
          <label class="form-label">Finalización</label>
          <input type="date" class="form-control" v-model="form.limited">
        </div>
    </div>



    <div class="mb-3">
      <label class="form-label">Actividad</label>
      <textarea v-model="form.activity" class="form-control" :class="{ 'is-invalid': errors.activity }" rows="2"></textarea>
      <div class="invalid-feedback" v-if="errors.activity">{{ errors.activity }}</div>
    </div>

    

    <div class="mb-3">
      <label class="form-label">Prioridad</label>
      <div class="d-flex justify-content-between align-items-center gap-2" :class="{ 'is-invalid': errors.priority }">
        <div class="priority-option" :class="{ 'priority-high': form.priority === 'Alta' }" @click="form.priority = 'Alta'">
          <input v-model="form.priority" type="radio" name="priority" id="priorityHigh" value="Alta" class="d-none">
          <label for="priorityHigh">Alta</label>
        </div>
        
        <div class="priority-option" :class="{ 'priority-medium': form.priority === 'Media' }" @click="form.priority = 'Media'">
          <input v-model="form.priority" type="radio" name="priority" id="priorityMedium" value="Media" class="d-none">
          <label for="priorityMedium">Media</label>
        </div>
        
        <div class="priority-option" :class="{ 'priority-low': form.priority === 'Baja' }" @click="form.priority = 'Baja'">
          <input v-model="form.priority" type="radio" name="priority" id="priorityLow" value="Baja" class="d-none">
          <label for="priorityLow">Baja</label>
        </div>
      </div>
      <div class="invalid-feedback d-block" v-if="errors.priority">{{ errors.priority }}</div>
    </div>
    
    <div class="mb-3">
      <label class="form-label">Descripción</label>
      <textarea v-model="form.description" class="form-control" rows="3" :class="{ 'is-invalid': errors.description }"></textarea>
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
</template>

<script>

import axios from 'axios'
import { useToast } from 'vue-toastification'
import { h } from 'vue'
import CustomToast from './CustomToast.vue'

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id
console.log('Usuario creador:', usuario_creador)

export default {
  name: 'TaskForm',
  components: {
    CustomToast
  },
  data() {
    return {
      form: {
        user: '',
        project: '',
        activity: '',
        description: '',
        priority: '',
        limited: ''
      },
      errors: {},
      projects: [],
      users: [],
      loading: false
    }
  },
  async created() {
    // Cargar proyectos al iniciar el componente
    await this.loadProjects();
    await this.loadUsers()
  },
  methods: {
    async loadProjects() {
      try {
        const response = await axios.get('http://localhost:4000/api/project');
        this.projects = response.data;
      } catch (error) {
        console.error('Error cargando proyectos:', error);
      }
    },
    async loadUsers() {
      try {
        const response = await axios.get(`http://localhost:4000/api/usuarios/trabajadores/${usuario_creador}`);
        this.users = response.data;
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
      }
    },
    validateForm() {
      this.errors = {} // resetear errores

      if (!this.form.user) {
        this.errors.user = 'Debes asignar un usuario.'
      }
      if (!this.form.project) {
        this.errors.project = 'Selecciona un proyecto'
      }
      if (!this.form.activity) {
        this.errors.activity = 'Este campo es obligatorio'
      }
      if (!this.form.priority) {
        this.errors.priority = 'Esto es obligatorio'
      }
      if (!this.form.description) {
        this.errors.description = 'Este campo es obligatorio'
      }
      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      const toast = useToast()
        if (!this.validateForm()) {
          return // no enviar si hay errores
        }

      try {
        const taskData = {
          usuario_id: this.form.user,
          proyecto_id: this.form.project,
          actividad: this.form.activity,
          descripcion: this.form.description,
          prioridad: this.form.priority,
          fecha_limite: this.form.limited,
          usuario_creador: usuario_creador
        }
        // console.log('tareas:', taskData)
        const response = await fetch('http://localhost:4000/api/tasks', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(taskData)
        })
        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 409) {
            toast.error(
              h(CustomToast, {
                title: 'Error',
                message: 'No se pudo asignar la actividad'
              })
            )
          }
          throw new Error(errorData.error || 'No se pudo asignar la actividad')
        }
        const savedTask = await response.json()
        toast.success(
          h(CustomToast, {
            title: 'Actividad asignada'
          })
        )
        this.$emit('saved', savedTask)
        this.resetForm()
      } catch (error) {
        toast.warning(
          h(CustomToast, {
            title: 'Algo salio mal',
            message: 'Por favor, intenta de nuevo más tarde'
          })
        )
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
/* input[type="date"] {
  border: 1px solid #ced4da;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
  font-size: 1rem;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.4);
  cursor: pointer;
} */


/* Tus estilos originales se mantienen igual */
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