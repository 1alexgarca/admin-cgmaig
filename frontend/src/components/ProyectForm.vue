<template>
  <form @submit.prevent="handleSubmit">
    <h2 class="fs-3 mb-4">Nuevo Proyecto</h2>

    <div class="mb-4">
      <label class="form-label">Proyecto</label>
        <input type="text" class="form-control" v-model="form.project" placeholder="Nombre del proyecto" required>
    </div>

    <div class="mb-4">
        <label class="form-label">Proporcione descripción</label>
         <div>
            <textarea class="form-control" placeholder="Describe aquí"  style="height: 100px" v-model="form.description"></textarea>
            <!-- <label for="floatingTextarea2">Comments</label> -->
        </div>
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
import { useToast } from 'vue-toastification';
import { h } from 'vue'
import CustomToast  from './CustomToast.vue';

export default {
  name: 'ProyectForm',
  components: {
    CustomToast
  },
  data() {
    return {
      form: {
        project: '',
        description: '',
      }
    }
  },
  methods: {
    async handleSubmit() {
      const toast = useToast()
      try {
        const proyectData = {
          project: this.form.project,
          description: this.form.description
        }
        const response = await fetch('http://localhost:4000/api/project', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body:  JSON.stringify(proyectData)
        })
        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 409) {
            toast.error(
              h(CustomToast, {
                title: 'Error',
                message: 'El proyecto ya esta registrado',
                buttonAction: () => this.resetForm()
              })
            )
          }
          throw new Error(errorData.error || 'No se puedo guardar el proyecto')
        } 
        const savedProject = await response.json()
        toast.success(
          h(CustomToast, {
            title: 'Proyecto guardado con éxito',
            buttonAction: () => this.$emit('nextApproval')
          })
        )
        this.$emit('saved', savedProject)
        this.resetForm()
      } catch (error) {
        toast.warning(
          h(CustomToast, {
            title: 'Algo salio mal',
            message: 'Por favor, intenta de nuevo más tarde',
            buttonAction: () => {}
          })
        )
      }
    },
    resetForm() {
      this.form = {
        project: '',
        description: ''
      }
    }
  }
}
</script>

<style scoped>
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