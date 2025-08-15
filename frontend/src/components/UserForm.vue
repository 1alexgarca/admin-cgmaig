<template>
  <form @submit.prevent="handleSubmit" class="needs-validation">
    <h2 class="fs-3 mb-4">Usuario Nuevo</h2>
    <div class="mb-4">
      <label class="form-label" for="validationCustoUsername">Nombre</label>
      <input type="text" class="form-control" v-model="form.name" placeholder="Nombre del usuario" required>
    </div>

    <label class="form-label">Apellidos</label>
    <div class="input-group mb-4">
        <input type="text" class="form-control" placeholder="Ap. Paterno" aria-label="Ap. Paterno" v-model="form.lastNameP">
        <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
        <input type="text" class="form-control" placeholder="Ap. Materno" aria-label="Ap. Materno" v-model="form.lastNameM">
    </div>

    <div class="mb-4">
        <label class="form-label">Correo electronico</label>
         <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="alguien" aria-label="Mail" aria-describedby="basic-addon2" v-model="form.email">
            <!-- <input type="text" class="input-group-text" id="basic-addon2" placeholder="@tabasco.gob.mx"> -->
            <span class="input-group-text" id="basic-addon2">@tabasco.gob.mx</span>
        </div>
    </div>

    <div class="mb-5">
        <label class="form-label">Núm. telefónico</label>
        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1"><i class="bi bi-telephone-fill"></i></span>
            <input type="text" class="form-control" placeholder="999-999-9999" maxlength="12" v-model="form.phoneNumber" @input="formatPhone">
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
import { useToast } from 'vue-toastification'
import { h } from 'vue'
import CustomToast from './CustomToast.vue'

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id
console.log('Usuario creador:', usuario_creador)

export default {
  name: 'UserForm',
  components: {
    CustomToast
  },
  data() {
    return {
      form: {
        name: '',
        lastNameP: '',
        lastNameM: '',
        email: '',
        phoneNumber: ''
      }
    }
  },
  methods: {
    formatPhone() {
      let num = this.form.phoneNumber.replace(/\D/g, '')
      if (num.length > 6) {
        num = num.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3')
      } else if (num.length > 3) {
        num = num.replace(/^(\d{3})(\d{3})$/, '$1-$2')
      }
      this.form.phoneNumber = num.substring(0, 12)
    },
    async handleSubmit() {
      const toast = useToast()
   
      try {
        const userData = {
          name: this.form.name,
          lastNameP: this.form.lastNameP,
          lastNameM: this.form.lastNameM,
          email: `${this.form.email}@tabasco.gob.mx`,
          phoneNumber: this.form.phoneNumber,
          usuario_creador: usuario_creador
        }
        const response = await fetch('http://localhost:4000/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 409) {
            toast.error(
              h(CustomToast, {
                title: 'Error',
                message: 'El correo electrónico ya existe',
                buttonText: 'Try Again',
                buttonAction: () => this.resetForm()
              })
            )
          } 
          throw new Error(errorData.error || 'Failed to save user')
        }

        const savedUser = await response.json()
        toast.success(
          h(CustomToast, {
            title: 'Usuario guardado con éxito.',
            message: `Contraseña temporal : ${savedUser.tempPassword}`,
            buttonText: 'Copiar',
            buttonAction: () => {
              navigator.clipboard.writeText(savedUser.tempPassword)
            }
          })
        )
        this.$emit('saved', savedUser)
        this.resetForm()
      } catch (error) {
        toast.warning(
          h(CustomToast, {
            title: 'Algo salió mal',
            message: 'Por favor, intenta de nuevo más tarde.',
            buttonAction: () => {}
          })
        )
      }
    },
    resetForm() {
      this.form = {
        name: '',
        lastNameP: '',
        lastNameM: '',
        email: '',
        phoneNumber: ''
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

