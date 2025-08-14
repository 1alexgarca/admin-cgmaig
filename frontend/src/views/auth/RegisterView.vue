<template>
  <div class="login-container">
    <div class="background-overlay"></div>
    <div class="content-wrapper">
      <div class="logo-section">
        <img src="@/assets/3.png" alt="CGMAIG Logo" class="logo-img" />
        <h1 class="app-title text-gob">Sistema de Gestión y Control de Actividades</h1>
        <p class="text-gob fw-bold">Gobierno del estado de Tabasco</p>
      </div>
      <div class="login-form">
        <div class="form-header">
          <h2 class="form-title text-gob">Bienvenido</h2>
          <p class="form-subtitle">Registrate para gestionar tus actividades</p>
        </div>
        <form @submit.prevent="handleSubmit" class="needs-validation">
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
                    <input type="text" class="form-control" placeholder="999-999-9999" aria-label="Username" aria-describedby="basic-addon1" maxlength="12" v-model="form.phoneNumber" @input="formatPhone">
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
        <!-- <form @submit.prevent="handleLogin" class="form-content">
          <div class="input-group animated-input">
            <input
              v-model="form.email"
              type="email"
              class="form-control custom-input"
              placeholder="Correo electrónico"
            />
            <span class="input-icon"><i class="bi bi-envelope-fill"></i></span>
          </div>
          <div v-if="errors.email" class="text-danger mt-1">{{ errors.email }}</div>

          <div class="input-group animated-input mt-3">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control custom-input"
              placeholder="Contraseña"
            />
            <span class="input-icon" @click="togglePassword" role="button">
              <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
            </span>
          </div>
          <div v-if="errors.password" class="text-danger mt-1">{{ errors.password }}</div>

          <div class="forgot-password mt-3">
            <router-link to="/recover-password" class="text-primary">¿Olvidaste tu contraseña?</router-link>
          </div>

          <div v-if="errors.server" class="text-danger mt-2">{{ errors.server }}</div>

          <button type="submit" class="btn btn-custom-login bg-gob mt-3">
            Iniciar Sesión
            <i class="bi bi-arrow-right ms-2"></i>
          </button>
        </form> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const errors = ref({})
const showPassword = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

function validateForm() {
  errors.value = {}

  if (!form.email) {
    errors.value.email = 'El correo electrónico es obligatorio.'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.value.email = 'El correo electrónico no es válido.'
  }

  if (!form.password) {
    errors.value.password = 'La contraseña es obligatoria.'
  } else if (form.password.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres.'
  }

  return Object.keys(errors.value).length === 0
}

async function handleLogin() {
  if (!validateForm()) return

  try {
    const res = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (!res.ok) {
      const err = await res.json()
      errors.value.server = err.error || 'Error desconocido'
      return
    }

    const data = await res.json()

    localStorage.setItem('user', JSON.stringify(data.user))

    // Guardar usuario en Pinia y localStorage
    auth.login(data.user, 'token-demo') // Usa aquí el token real si tu backend lo proporciona

    router.push('/administrador')
  } catch (err) {
    console.error('Error en login:', err)
    errors.value.server = 'No se pudo conectar al servidor.'
  }
}
</script>

<style scoped>
.text-gob {
  color: rgb(221, 201, 163);
}

.bg-gob {
  background-color: rgb(118, 19, 59);
}

.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(118, 19, 59);
  /* background: linear-gradient(135deg, #1e3c72, #2a5298); */
  position: relative;
  overflow: hidden;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/escudosegob.png') repeat;
  opacity: 0.1;
  z-index: 1;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  max-width: 1200px;
  gap: 40px;
}

.logo-section {
  text-align: center;
  /* color: #fff; */
  animation: fadeIn 1.5s ease-in-out;
}

.logo-img {
  width: 500px;
  height: auto;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-top: 15px;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  animation: slideIn 1s ease-out;
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-title {
  font-size: 1.5rem;
  /* color: #2a5298; */
  font-weight: 600;
}

.form-subtitle {
  color: #6c757d;
  font-size: 0.9rem;
}

.animated-input {
  position: relative;
  margin-bottom: 15px;
}

.custom-input {
  border: none;
  border-bottom: 2px solid #dee2e6;
  border-radius: 0;
  padding: 10px 40px 10px 10px;
  font-size: 1rem;
  transition: border-bottom 0.3s ease;
}

.custom-input:focus {
  border-bottom: 2px solid #2a5298;
  outline: none;
  box-shadow: none;
}

.input-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  transition: color 0.3s ease;
}

.input-icon:hover {
  color: #2a5298;
}

.forgot-password {
  text-align: right;
  margin-bottom: 20px;
}

.btn-custom-login {
  /* background: linear-gradient(45deg, #2a5298, #1e3c72); */
  color: #fff;
  border: none;
  padding: 10px 20px;
  width: 100%;
  font-weight: 500;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-custom-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(42, 82, 152, 0.5);
}

.signup-prompt {
  text-align: center;
  color: #6c757d;
}

.signup-prompt a {
  font-weight: 500;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
