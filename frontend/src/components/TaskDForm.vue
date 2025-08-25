<template>
<div>
  <div class="d-flex justify-content-center row">
    <div class="rounded-circle d-flex justify-content-center align-items-center fs-1 " style="height: 80px; width: 80px;">
      <i class="bi bi-exclamation-triangle-fill"></i>
    </div>
    <div class="text-center mt-3 mb-4">
      <p class="fs-4 fw-bold">Confirmar Eliminación</p>
      <small>Esta acción no se puede deshacer</small>
    </div>

    <div>
      <p class="fw-bold text-center">
        ¿Estás seguro de que deseas eliminar esta actividad?
      </p>
    </div>
  </div>
  
  <form @submit.prevent="handleSaved">
    <div class="card p-3 rounded-5 activity-card">
      <div class="card-body">
        <div class="text-center text-body-secondary row">
          <small>Asignado:</small>
          <p class="text-black fw-medium">{{ datos.asignado }}</p>
        </div>
        <div class="row mb-3">
          <small class="mb-2">PROYECTO</small>
          <h5 class="fw-bold">{{ datos.proyecto }}</h5>
        </div>
        <div class="row mb-3">
          <small class="mb-2">ACTIVIDAD</small>
          <div class="rounded-pill p-2 d-flex align-items-center justify-content-center fw-bold mx-3 activity-act" style="width: auto;">
            {{ datos.actividad }}
          </div>
        </div>
        <div class="row">
          <small class="mb  -2">DESCRIPCIÓN</small>
          <p class="fst-italic fw-bold">{{ datos.descripcion }}</p>
        </div>
      </div>
      <div class="d-flex justify-content-between">
        <button class="btn btn-cancel text-white fw-bold rounded-4" type="button" @click="$emit('cancel')" style="width: 38%;">
          <i class="bi bi-x-circle"></i>
          Cancelar
        </button>
        <button class="btn btn-submit text-white fw-bold rounded-4" type="submit" style="width: 60%;">
          <i class="bi bi-floppy"></i>
          Eliminar
        </button>
      </div>
    </div>
  </form>

</div>
</template>

<script>
 
import { useToast } from 'vue-toastification'
import { h } from 'vue'
import CustomToast from './CustomToast.vue'

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id
// console.log('Usuario creador:', usuario_creador)

export default {
  name: 'TaskDForm',
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
      }
    }
  },
  mounted() {
    this.datos = { ...this.initialData }
  },
  methods: {
    async handleSaved() {
        const toast = useToast()
        
        try {
            const response = await fetch(`http://localhost:4000/api/tasks/delete/${this.datos.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            })
            const result = await response.json()

            if (!response.ok) {
                const errorData = await response.json()
                if (response.status === 409) {
                    toast.error(
                        h(CustomToast, {
                            title: 'Error',
                            message: 'No se pudo eliminar la actividad'
                        })
                    )
                }
                throw new Error(errorData.error || 'No se pudo eliminar')
            }
            toast.success(
                h(CustomToast, {
                    title: 'Actividad eliminada correctamente'
                })
            )
            this.$emit('saved', result.deletedTask)
        } catch (error) {
            toast.warning(
                h(CustomToast, {
                    title: 'Algo salio mal',
                    message: 'Por favor intenta más tarde'
                })
            )
        }
    }
  }
}

</script>

<style>
.btn-submit{
  background: linear-gradient(90deg, rgb(105, 28, 32), rgb(111, 114, 113)); 
  height: 50px;
}

.btn-cancel {
  background: linear-gradient(90deg, rgb(16, 49, 43), rgb(111, 114, 113)); 
}

/* Card de actividad moderna */
.activity-card {
  border: 2px solid rgba(188, 149, 92, 0.2);
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.activity-act {
  border: 2px solid rgba(105, 28, 32, 0.2);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(105, 28, 32, 0.2);
}
</style>