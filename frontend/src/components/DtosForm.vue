<template>
    <div>
        <h2 class="fs-3 border-bottom" style="padding-bottom: .6rem;">{{ actividad.actividad }}</h2>
        
        <div class="text-end mb-3">
            <span class="text-body-tertiary mb-3">{{ actividad.name_proyect }}</span>
        </div>

        <div class="mb-4">                        
            <div class="progress" role="progressbar">
                <div class="progress-bar text-bg-info progress-bar-striped" :style="{ width: actividad.avance + '%' }">{{ actividad.avance }} %</div>
            </div>
        </div>

        <div class="d-flex justify-content-center">
            <ul class="nav nav-pills bg-body-secondary bg-gradient rounded-4" id="pills-tab" role="tablist" style="padding: 3px;">
                <li class="nav-item" role="presentation"> 
                    <button class="nav-link active rounded-4" id="pills-general-tab" data-bs-toggle="pill" data-bs-target="#pills-general" type="button" role="tab" aria-controls="pills-general" aria-selected="true">Datos generales</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link rounded-4" id="pills-editables-tab" data-bs-toggle="pill" data-bs-target="#pills-editables" type="button" role="tab" aria-controls="pills-editables" aria-selected="false">Editar datos</button>
                </li>
            </ul>
        </div>

        <div class="tab-content mt-3" id="pills-tabContent">
            <div class="tab-pane fade show active" id="pills-general" role="tabpanel" aria-labelledby="pills-general-tab">
                <div>
                    <div>
                        <table class="table table-borderless">
                            <thead>
                                <tr>
                                    <td class="text-muted">
                                        <i class="bi bi-clock-history persoData"></i>    
                                        Fecha creación
                                    </td>
                                    <td>{{ fechaForm(actividad.fecha_creacion) }}</td>
                                </tr>

                                <tr>
                                    <td class="text-muted">
                                        <i class="bi bi-stopwatch persoData"></i>
                                        Horas trabajadas
                                    </td>
                                    <td>{{ actividad.horas_trabajadas }} hrs</td>
                                </tr>

                                <tr>
                                    <td class="text-muted">
                                        <i class="bi bi-arrow-repeat persoData"></i>
                                        Estado
                                    </td>
                                    <td>
                                        <span class="badge" style="margin-right: 1rem;"
                                          :class="{
                                           'bg-success-subtle text-success': actividad.avance === 100,
                                           'bg-warning-subtle text-warning': actividad.avance > 0 && actividad.avance < 100
                                          }"
                                        >
                                          <span class="fw-bold" v-if="actividad.avance < 100">• En progreso</span>
                                          <span class="fw-bold" v-else="actividad.avance === 100">• Completado</span>
                                        </span>
                                        <span style="height: 20px; width: 60px;" class="badge"
                                            :class="[badgePriority(actividad.prioridad)]">
                                                {{ actividad.prioridad }}
                                            </span>
                                    </td>
                                </tr>
                            </thead>
                        </table>
                    </div>
    
                    <div class="form-floating mb-3">
                        <textarea class="form-control"  id="floatingTextarea2Disabled" style="height: auto" disabled>{{ actividad.descripcion }}</textarea>
                        <label for="floatingTextarea2Disabled">Descripción</label>
                    </div>
        
                    <div>
                        <h5 class="text-center fw-bold">Tabla de actualizaciones</h5>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Fecha de actualización</th>
                                    <th>Hrs trabajadas</th>
                                    <th>Avance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="tab-pane fade" id="pills-editables" role="tabpanel" aria-labelledby="pills-editables-tab">
                <form @submit.prevent="handleSubmit">
                    <table class="table table-borderless">
                        <tbody>
                            <tr>
                                <td>Actividad</td>
                                <td>
                                    <input v-model="form.actividad" type="text" class="form-control bg-body-tertiary">
                                </td>
                            </tr>
                            <tr>
                                <td>Horas trabajadas</td>
                                <td>
                                    <input v-model="form.horas" type="text" class="form-control bg-body-tertiary">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <i><output>{{ form.avance }}%</output></i>
                                     de avance
                                </td>
                                <td>
                                    <input v-model="form.avance" type="range" class="form-range" min="0" max="100" value="0">
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="form-floating mb-4">
                        <textarea v-model="form.descripcion" class="form-control" placeholder="Leave a comment here" id="floatingTextarea2" style="height: 80px"></textarea>
                        <label for="floatingTextarea2">Descripción</label>
                    </div>

                    <div class="text-end">
                        <button type="submit" class="btn btn-primary">Guardar los nuevos datos</button>
                    </div>
                </form>
            </div>
        </div>
    </div>


<!-- Modal de confirmación si se exceden las 8 horas -->
<div class="modal fade bg-dark bg-opacity-75" id="horasModal" ref="horasModal" style="z-index: 1100;">
  <div class="modal-dialog modal-dialog-centered" style="width: 30rem;">
    <div class="modal-content rounded-5" style="background: rgba(238, 251, 80, 2);">
      <div class="modal-header text-center row row-columns  border-0">
        <h1 class="bi bi-exclamation-triangle-fill"></h1>
        <h5 class="title fw-bold">Advertencia de Horas</h5>
      </div>
      <div class="modal-body text-center">
        <p class="fw-medium">El total de horas trabajadas hoy superará las 8 horas. ¿Deseas continuar?</p>
      </div>
      <hr style="margin-left: 1rem; margin-right: 1rem;" class="text-black">
      <div class="modal-footer d-flex justify-content-center border-0">
        <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-warning" @click="confirmarGuardarActividad">Sí, guardar</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { h } from 'vue'
import CustomToast  from './CustomToast.vue'
import * as bootstrap from 'bootstrap'
import dayjs from 'dayjs'
import 'dayjs/locale/es'


const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id
const toast = useToast()

export default {
    props: {
        actividad: Object
    },
    emits: ['saved', 'cancel'],
    data() {
        return {
            vistaActual: 'general',
            pendienteGuardar: null,
            horasHoy: 0,
            modalInstance: null,
            form: {
                actividad: this.actividad?.actividad || '',
                descripcion: this.actividad?.descripcion || '',
                horas: '',
                avance: '',
                project: ''
            }
        }
    },
    mounted() {

        const modalElement = this.$refs.horasModal
        if (modalElement) {
            this.modalInstance = new bootstrap.Modal(modalElement)
        }
    },
    methods: {
    async handleSubmit() {
        try {
        const res = await fetch(`http://localhost:4000/api/usuarios/${userId}/horas-hoy`)
        const data = await res.json()
        this.horasHoy = Number(data.total_horas) || 0

        const horasNuevas = Number(this.form.horas) || 0
        const totalHoras = this.horasHoy + horasNuevas

        if (totalHoras > 8) {
            this.pendienteGuardar = {
            ...this.form,
            id: this.actividad.id_activities
            }
            this.modalInstance.show()
            return
        }

        await this.enviarActualizacion(this.actividad.id_activities)
        } catch (err) {
        toast.warning(h(CustomToast, {
            title: 'Error al verificar horas',
            message: 'Ocurrió un problema al validar las horas trabajadas hoy'
        }))
        }
    },

    cancelarHorasExtra() {
        this.pendienteGuardar = null
        this.modalInstance?.hide()
    },

    async confirmarGuardarActividad() {
        if (!this.pendienteGuardar) return
        await this.enviarActualizacion(this.pendienteGuardar.id)
        this.modalInstance.hide()
        this.pendienteGuardar = null
    },

    async enviarActualizacion(idActividad) {
        try {
        const { actividad, descripcion, horas, avance } = this.form

        // 1. Actualizar actividad (nombre y descripción)
        const res1 = await fetch(`http://localhost:4000/api/actividades/${idActividad}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actividad, descripcion })
        })

        // 2. Actualizar registro de avance y horas trabajadas
        const res2 = await fetch(`http://localhost:4000/api/actividades/${idActividad}/avance`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avance, horas_trabajadas: horas })
        })

        if (!res1.ok || !res2.ok) {
            const errorMsg = !res1.ok
            ? await res1.json()
            : await res2.json()

            toast.error(h(CustomToast, {
            title: 'Error al actualizar',
            message: errorMsg.error || 'No se pudo guardar la actividad'
            }))
            return
        }

        toast.success(h(CustomToast, {
            title: 'Actividad actualizada'
        }))

        this.$emit('saved')  // o recargar actividad si lo deseas
        } catch (error) {
        toast.warning(h(CustomToast, {
            title: 'Algo salió mal',
            message: 'Por favor, intenta de nuevo más tarde'
        }))
        }
    },
    badgePriority(prioridad) {
        switch (prioridad?.toLowerCase()) {
            case 'alta':
                return 'bg-danger'
            case 'media':
                return 'bg-warning'
            case 'baja':
                return 'bg-success'
        }
    },
    fechaForm(fecha) {
        const formDate = dayjs(fecha).format('MMMM DD, YYYY')
        return formDate.charAt(0).toUpperCase() + formDate.slice(1)
    }
}


}
</script>

<style scoped>
.persoData {
  margin-right: .6rem;
}
</style>