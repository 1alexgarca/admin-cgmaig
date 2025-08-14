<template>
  <h2 class="fs-3 mb-5 text-center ">Actualizar proyecto</h2>
  <div class="d-flex">    
      <div class="col-sm-5 container">
        <div class="card bg-secondary-subtle">
          <div class="card-body" style="height: auto;">
              <h6>Nombre:</h6>
              <p>{{ datos.project }}</p>
              <h6>Descripción</h6>
              <p>{{ datos.description }}</p>

          </div>
        </div>
      </div>

    <form @submit.prevent="handleSaved" style="width: 60%;">

      <div class="mb-4">
        <label class="form-label">Nombre del proyeto</label>
          <input type="text" class="form-control" v-model="form.project" placeholder="Nombre del proyecto">
      </div>
  
      <div class="mb-4">
          <label class="form-label">Proporcione descripción</label>
           <div>
              <textarea class="form-control" placeholder="Describe aquí"  style="height: 100px" v-model="form.description"></textarea>
          </div>
      </div>
  
      
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary">
          Actualizar
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import { h } from 'vue'
import CustomToast  from './CustomToast.vue';

export default {
  name: 'ProjectUpdate',
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
  mounted() {
    this.datos = { ...this.initialData}
  },
  methods: {
    async handleSaved() {
    const toast = useToast()
      try {
        const payload = {
          project: this.form.project,
          description: this.form.description
        }
        const response = await fetch(`http://localhost:4000/api/project/${this.datos.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        })
        const result = await response.json()

        if(!response.ok) {
          const errorData = await response.json()
          if (response.status === 409){
            toast.error(
              h(CustomToast, {
                title: 'Error',
                message: 'No se pudo actualizar'
              })
            ) 
          }
          throw new Error(errorData.error || 'No se pudo actualizar')
        }
        // const savedProject = await response.json()
        toast.success(
          h(CustomToast, {
            title: 'Se actualizo con éxito'
          })
        )
        this.$emit('saved', result.updatedProject)
      } catch (error){
        toast.warning(
          h(CustomToast, {
            title: 'Algo salio mal',
            message:'Por favor, intente de nuevo más tarde'
          })
        )
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