<template>
  <div class="userview-content mt-5">
    <div class="row m-3 ">
        <div class="card mb-2">
            <div class="card-body">
            <div class="mb-4 d-flex justify-content-between align-items-center">
                <div class="">
                    <h3 class="card-title">Perfil de Usuario</h3>
                    <p class="card-text">Aquí puedes ver y editar tu información personal.</p>
                </div>
                <div>
                    <button 
                        type="button" class="btn btn-primary"
                        style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;"
                        @click="$refs.fileInput.click()">
                    <i class="bi bi-pencil" style="margin-right: .5rem;"></i>
                        Editar imagen
                    </button>
                </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div style="width: 10rem;">
                        <div 
                            style="width: 10rem; height: 10rem; overflow: hidden; border-radius: 50%;"
                            class="bg-light d-flex align-items-center justify-content-center">
                            <img 
                                :src="imagenUrl" 
                                class="img-fluid" 
                                alt="Perfil de Usuario"
                                style="height: 100%; object-fit: cover;">
                        </div>
                        <div class="card-body text-center">
                            <button 
                                type="button" class="btn btn-primary"
                                style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">
                                    Cambiar Contraseña
                            </button>
                        </div>
                    </div>
                    <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange" hidden>
                </div>

                <div>
                    <div>
                        <h4>Dirección General</h4>
                        <p class="card-text">Dirección General de Enlace Institucional de Tecnologias de
                            la Información y Comunicaciones
                        </p>
                        <p class="card-text">Secretearía de Administración y Finanzas</p>
                    </div>
                </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="mb-4 w-100">
                    <ul class="nav nav-underline justify-content-center">
                        <li class="nav-item">
                            <a 
                                class="nav-link" 
                                :class="{ active: vistaActual === 'datosPersonales' }" 
                                @click="vistaActual = 'datosPersonales'"
                                style="cursor: pointer;"
                            >
                            
                                Datos personales
                            </a>
                        </li>
                        <li class="nav-item">
                            <a 
                                class="nav-link" 
                                :class="{ active: vistaActual === 'seguridad' }" 
                                @click="vistaActual = 'seguridad'"
                                style="cursor: pointer;"
                            >
                                Seguridad
                            </a>
                        </li>
                    </ul>
                </div>
                <form v-if="vistaActual === 'datosPersonales'">
                    <div>
                        <h4 class="card-title">Datos personales</h4>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div style="width: 100%; margin-right: 1rem;">
                            <label class="form-label">Nombre</label>
                            <input v-model="nombre" type="text" class="form-control">
                        </div>
                        <div style="width: 100%; margin-left: 1rem;">
                            <label class="form-label">Apellido Paterno</label>
                            <input v-model="paterno" type="text" class="form-control">
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div style="width: 100%; margin-right: 1rem;">
                            <label class="form-label">Apellido Materno</label>
                            <input v-model="materno" type="text" class="form-control">
                        </div>
                        <div style="width: 100%; margin-left: 1rem;">
                            <label class="form-label">Número de celular</label>
                            <input v-model="telefono" type="text" class="form-control">
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div style="width: 100%; margin-right: 1rem;">
                            <label class="form-label">Correo electronico</label>
                            <input v-model="email" type="text" class="form-control" disabled>
                        </div>
                        <div style="width: 100%; margin-left: 1rem;" class="d-flex justify-content-end">
                            <button type="button" class="btn btn-secondary btn-sm" style="margin-right: 1rem; width: 8rem;">Cancelar</button>
                            <button @click="handleSubmit" type="button" class="btn btn-primary btn-sm" style="width: 8rem;">Guardar</button>
                        </div>
                    </div>
                </form>
                <form v-if="vistaActual === 'seguridad'" @submit.prevent="cambiarPassword">
                    <div class="mb-4">
                        <h4 class="card-title">Seguridad</h4>
                    </div>

                    <!-- Campo de usuario oculto para accesibilidad -->
                    <input type="text" name="username" autocomplete="username" style="display: none;">

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div style="width: 100%; margin-right: 1rem;">
                        <label class="form-label">Contraseña actual</label>
                        <input
                            v-model="form.actual"
                            type="password"
                            class="form-control"
                            placeholder="Contraseña actual"
                            autocomplete="current-password"
                            @input="verificarPasswordActual"
                        >
                        <small v-if="passwordValida === false" class="text-danger">Contraseña incorrecta</small>
                        </div>

                        <div style="width: 100%; margin-left: 1rem; margin-right: 1rem;">
                        <label class="form-label">Nueva contraseña</label>
                        <input
                            v-model="form.nueva"
                            type="password"
                            class="form-control"
                            placeholder="Nueva contraseña"
                            autocomplete="new-password"
                        >
                        </div>

                        <div style="width: 100%; margin-left: 1rem;">
                        <label class="form-label">Repetir contraseña</label>
                        <input
                            v-model="form.repetir"
                            type="password"
                            class="form-control"
                            placeholder="Repetir nueva contraseña"
                            autocomplete="new-password"
                        >
                        <small v-if="form.nueva !== form.repetir" class="text-danger">Las contraseñas no coinciden</small>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end mb-3" style="margin-left: 1rem;">
                        <button type="button" class="btn btn-secondary btn-sm" style="margin-right: 1rem; width: 8rem;">Cancelar</button>
                        <button type="submit" class="btn btn-primary btn-sm" style="width: 8rem;">Guardar</button>
                    </div>
                </form>

            </div>
        </div>
    </div>
  </div>


</template>

<script>
import axios from 'axios'
import defaultImage from '@/assets/perfil.webp'
import { useToast } from 'vue-toastification'
import CustomToast from '@/components/CustomToast.vue'
import { h } from 'vue'

const user = JSON.parse(localStorage.getItem('user'))
const toast = useToast()
const userId = user?.id

export default {
  name: 'PerfilView',
  components: {
    CustomToast
  },
  data() {
    return {
      vistaActual: 'datosPersonales',
      selectedImage: null,
      imagenUrl: '',
      nombre: user.name || '',
      paterno: user.paterno || '',
      materno: user.materno || '',
      email: user.email || '',
      telefono: user.telefono || '',
      imagen: user.imagen || defaultImage,
      form: {
        actual: '',
        nueva: '',
        repetir: ''
      },
      passwordValida: null

    };
  },
  mounted(){
    this.obtenerImagen().then(imagen => {
        if (imagen) {
            this.imagenUrl = `http://localhost:4000${imagen}`
        } else {
            this.imagenUrl = defaultImage
        }
    })
  },
  computed: {
    formularioValido() {
        return (
            this.passwordValida &&
            this.nuevaPassword &&
            this.nuevaPassword !== this.passwordActual &&
            this.nuevaPassword === this.repetirPassword
        )
    }
  },
  methods: {
    async handleFileChange(event) {
        const file = event.target.files[0]

        if (!file) return

        const formData = new FormData()
        formData.append('imagen', file)

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.post(`http://localhost:4000/api/usuarios/${user.id}/imagen`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', 
                }
            })
            const nuevaRuta = res.data.ruta

            this.imagenUrl = `http://localhost:4000${nuevaRuta}`;
            localStorage.setItem('user', JSON.stringify({ ...user, imagen: nuevaRuta }));
            console.log('Imagen subida:', res.data.ruta);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    },
    async handleSubmit() {

        try {
            const payload = {
                nombre: this.nombre,
                paterno: this.paterno,
                materno: this.materno,
                email: this.email,
                telefono: this.telefono
            }
            const response = await fetch(`http://localhost:4000/api/usuarios/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            })
            // const result = await response.json()

           if(!response.ok) {
                const errorData = await response.json()
                if (response.status === 400) {
                    toast.error(
                        h(CustomToast, {
                            title: 'Error',
                            message: 'Error al actualizar los datos'
                        })
                    )
                }
                throw new Error(errorData.error || 'Error al actualizar los datos')
            }
            
            const updatedUser = { ...user, ...payload };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            toast.success(
                h(CustomToast, {
                    title: 'Éxito',
                    message: 'Datos actualizados correctamente'
                })
            )
            // this.$router.push( result.updatedUser );
        } catch (error) {
            toast.warning(
                h(CustomToast, {
                    title: 'Error',
                    message: 'Error al guardar los datos'
                })
            )
        }
    },
    async obtenerImagen() {
        try {
            const res = await fetch(`http://localhost:4000/api/usuarios/${userId}/imagen`)
            const data = await res.json()

            if (data.success) {
                return data.imagen
            } else {
                throw new Error(data.error)
            }
        } catch (err) {
            console.error('Error al obtener imagen:', err.message)
            return null
        }
    },
    async verificarPasswordActual() {
        const res = await fetch(`http://localhost:4000/api/usuarios/verificar-password/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: this.form.actual })
        });
        const data = await res.json();
        this.passwordValida = data.esValida; // true o false desde el backend
    },
    async cambiarPassword() {
        if (!this.passwordValida) {
        alert('La contraseña actual no es válida');
        return;
        }

        if (this.form.nueva !== this.form.repetir) {
        alert('Las contraseñas nuevas no coinciden');
        return;
        }

        const res = await fetch(`http://localhost:4000/api/usuarios/${userId}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentPassword: this.form.actual,
                newPassword: this.form.nueva
            })
        });

        const data = await res.json();
        if (data.success) {
            toast.success(h(CustomToast, {
                title: 'Contraseña actualizada con exito'
            }))
        this.form = { actual: '', nueva: '', repetir: '' };
        } else {
            toast.error(h(CustomToast, {
                title: 'Algo salio mal',
                message: 'Por favor, intenta de nuevo más tarde'
            }))
        }
    }
  }
};
</script>
