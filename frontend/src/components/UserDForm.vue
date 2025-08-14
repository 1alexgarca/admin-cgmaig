<template>
    <div class="d-flex justify-content-center mb-3">
        <span class="text-center rounded-5 fs-2 col-md-2 icono_bg" >
            <i class="bi bi-exclamation-triangle-fill text-danger"></i>
        </span>
    </div>
    <div class="text-center">
        <p class="fs-4 fw-bold text-pass">¿Seguro quieres eliminar?</p>
    </div>

    <form @submit.prevent="handleSaved">
        <div class="card text-center mb-4">
            <div class="card-header text-gob text-white fw-semibold">
                {{ datos.nombre }}
            </div>
            <div class="card-body">
                <h5 class="card-title fw-bold text-pass">{{ datos.email }}</h5>
                <span class="d-flex justify-content-center">
                    <p class="card-text fw-bolder bg-gob text-white rounded-5" style="width: auto; padding: 0rem 1rem 0rem 1rem;">
                        {{ datos.telefono }}
                    </p>
                </span>
            </div>
        </div>

        <div class="d-grid gap-2">
            <button class="btn btn-danger" type="submit">Eliminar Actividad</button>
            <button class="btn btn-outline-dark" type="button" @click="$emit('cancel')">Cancelar</button>
        </div>
    </form>


</template>

<script>
 import { useToast } from 'vue-toastification'
import { h } from 'vue'
import CustomToast from './CustomToast.vue'

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id
// console.log('Usuario creador:', usuario_creador)

export default {
  name: 'UserDForm',
  components: {
    CustomToast
  },
  props: {
    initialData: {
      type: Object,
      default: () => ({ 
        id: '', 
        nombre: '', 
        email: '',
        telefono: ''
      })
    }
  },
  emits: ['saved', 'cancel'],
  data() {
    return {
      datos: {
        id: '', 
        nombre: '', 
        email: '',
        telefono: ''
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
            const response = await fetch(`http://localhost:4000/api/users/delete/${this.datos.id}`, {
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
                            message: 'No se pudo eliminar al usuario'
                        })
                    )
                }
                throw new Error(errorData.error || 'No se pudo eliminar')
            }
            toast.success(
                h(CustomToast, {
                    title: 'Usuario eliminado correctamente'
                })
            )
            this.$emit('saved', result.deletedUser)
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

<style scoped>
.icono_bg {
    background: rgba( 255, 0, 0, 0.3);
}

.text-gob {
    background: rgb(221, 201, 163);
}
.bg-gob {
    background-color: rgb(118, 19, 59);
}

.text-pass {
    color: rgb(118, 19, 59); 
}

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