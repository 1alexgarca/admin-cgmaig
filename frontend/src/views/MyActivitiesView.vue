<template>
    <div class="content-view">
        <div class="row g-4 mb-4">
            <!-- Card 1: Total Usuarios -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card mb-3 border-0 bg-info rounded-4 shadow bg-opacity-10">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5 class="card-title fw-bold">Actividades totales</h5>
                            <div class="rounded-circle bg-info d-flex justify-content-center align-items-center"
                                style="width: 50px; height: 50px;">
                                <i class="bi bi-journal-text text-white fs-3"></i>
                            </div>
                        </div>
                        <h3 class="text-info fw-bold">{{ estadisticas.tareasTotales }}</h3>
                    </div>
                </div>
            </div>

            <!-- Card 2: Nuevos Usuarios -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card mb-3 border-0 shadow bg-warning rounded-4 bg-opacity-10">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5 class="card-title fw-bold">Actividades en proceso</h5>
                            <div class="rounded-circle bg-warning d-flex justify-content-center align-items-center"
                                style="width: 50px; height: 50px;">
                                <i class="bi bi-journal-x text-white fs-3"></i>
                            </div>
                        </div> 
                        <h3 class="text-warning fw-bold">{{ estadisticas.enProgreso }}</h3>
                    </div>
                </div>
            </div>

            <!-- Card 3: Actividad Reciente -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card mb-3 border-0 shadow bg-success rounded-4 bg-opacity-10">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5 class="card-title fw-bold">Datos semanales</h5>
                            <button 
                                type="button"
                                class="btn rounded-circle" 
                                style="background: #5CE65C; width: 50px; height: 50px;"
                                @click="descargarPDF"    
                            >
                                <i class="bi bi-download text-white fs-4"></i>
                            </button>
                        </div>
                        <h3 class="fw-bold" style="color: #5CE65C;">Descarga estadisticas</h3>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex">
            <div style="width: 100%; padding: 1rem;" class="rounded-4 shadow border">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Estado</th>
                            <th>Actividad</th>
                            <th>Descripción</th>
                            <th>Prioridad</th>
                            <th>Avance</th>
                            <th>Hrs Trabajadas</th>
                        </tr>
                    </thead>
                    <tbody class="small">
                        <tr 
                            v-for="task in paginatedTasks" 
                            :key="task.id_activities" 
                            @click="openActivity(task)"
                            style="cursor: pointer;"
                        >
                            <td class="text-center">
                                <i v-if="task.avance === 100" class="bi bi-check2-circle text-success fs-4" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Completado"></i>
                                <i v-else="task.avance < 100" class="bi bi-hourglass-split text-warning fs-4 spin-hourglass" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="En proceso"></i>
                            </td>
                            <td>{{ task.actividad }}</td>
                            <td>{{ task.descripcion }}</td>
                            <td>
                                <span 
                                  :class="[badgePriority(task.prioridad)]"
                                  class="badge"
                                  style="height: 20px; width: 60px;"
                                >
                                  {{ task.prioridad }}
                                </span>                                
                            </td>
                            <td>{{ task.avance }}%</td>
                            <td>{{ task.horas_trabajadas }} hrs</td>
                        </tr>
                        <tr v-if="paginatedTasks.length === 0">
                            <td colspan="6" class="text-center">No hay registros</td>
                        </tr>
                    </tbody>
                </table>
               
                <div class="d-flex justify-content-center">
                    <nav aria-label="Page navigation example">
                        <ul class="pagination">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <a href="#" class="page-link" @click.prevent="currentPage--" aria-label="Previous">
                                    <span aria-hidden="true">&laquo;</span>
                                </a>
                            </li>
                            <li 
                                v-for="page in totalPages"
                                :key="page"
                                :class="{ active: currentPage === page }"
                                class="page-item"
                            >
                                <a href="#" class="page-link" @click.prevent="currentPage = page">{{ page }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <a href="#" class="page-link" @click.prevent="currentPage++" aria-label="Next">
                                    <span aria-hidden="true">&raquo;</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            
            <div style="width: 60%; margin-left: 1rem; padding-left: 1rem;">
                <form @submit.prevent="handleSubmit" class="border rounded-4 shadow" style="padding: 1rem;">
                    <p class="fs-5 fw-bold">Registra actividad</p>

                    <select v-model="form.project" :class="['form-select', errors.project && 'is-invalid']" class="mb-3">
                        <option value="" disabled selected>- - - Seleccione el proyecto - - -</option>
                        <option v-for="project in projects" :key="project.id_project" :value="project.id_project">
                            {{ project.name_project }}
                        </option>
                    </select>

                    <input v-model="form.actividad" type="text" class="form-control mb-4" placeholder="Nombre Actividad">

                    
                    <div class="mb-4">
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
                    
                    <div class="form-floating mb-3">
                        <textarea v-model="form.description" class="form-control" id="floatingTextarea"></textarea>
                        <label for="floatingTextarea">Descripción</label>
                    </div>

                    <div class="d-flex">
                        <div class="mb-3" style="width: 70%;">
                            <label for="customRange4" class="form-label">Avance de la actividad</label>
                            <input 
                              class="form-range"
                              type="range"
                              id="customRange4"
                              ref="rangeInput"
                              v-model="rangeValue"
                              min="0"
                              max="100"
                            />
                            <span ref="rangeOutput">{{ rangeValue }} %</span>
                        </div>
                        <div class="mb-3" style="width: 30%; margin-left: 1rem;">
                            <label for="" class="form-label">Hrs Trabajadas</label>
                            <input 
                                type="number"
                                v-model="form.horas"
                                class="form-control"
                                step="0.1"
                                min="0">
                        </div>
                    </div>



                    <div class="text-end">
                        <button type="submit" class="btn btn-primary btn-sm">Registrar actividad</button>
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

<DtosModal
  :showModal="showModal"
  :actividad="selectedActivity"
  @close="showModal = false"  
  @saved="handleActivityUpdated"
/>


</template>


<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { h } from 'vue'
import CustomToast from '@/components/CustomToast.vue';
import * as bootstrap from 'bootstrap'
import DtosModal from '@/components/DtosModal.vue';
import { ref } from 'vue'
import { Tooltip } from 'bootstrap';


const currentPage = ref(1)
const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id
const rangeInput = document.getElementById('customRange4')
const rangeOutput = document.getElementById('rangeValue')
const toast = useToast()

export default {
    components: {
        DtosModal
    },
    data() {
        return {
            form: {
                project: '',
                priority: '',
                horas: '',
                rangeValue: '',
                actividad: '',
                description: ''
            },
            errors: {},
            rangeValue: 0,
            projects: [],
            tasks: [],
            currentPage: 1,
            pageSize: 10,
            showModal: false,
            selectedActivity: null,
            refreshNeeded: false,
            estadisticas: {
                tareasCompletadas: 0,
                enProgreso: 0,
                tareasTotales: 0
            }

        }
    },
    async created() {
        await this.loadProjects()
        await this.loadActivities()
    },
    mounted() {
        const input = this.$refs.rangeInput
        const output = this.$refs.rangeOutput

        if (input && output) {
          output.textContent = input.value
          input.addEventListener('input', function() {
            output.textContent = this.value
          })
        }

        const modalElement = this.$refs.horasModal
        if (modalElement) {
            this.modalInstance = new bootstrap.Modal(modalElement)
        }
        this.initTooltips()
        this.cargarEstadisticas()
    },
    updated() {
        this.initTooltips()
    },
    methods: {
        async loadProjects() {
            try {
                const response = await axios.get('http://localhost:4000/api/project')
                this.projects = response.data
            } catch (error) {
                console.error('Error cargando proyectos:',  error)
            }
        },
        async handleSubmit() {
            
            try {
                const res = await fetch(`http://localhost:4000/api/usuarios/${userId}/horas-hoy`)
                const data = await res.json()
                this.horasHoy = data.total_horas || 0

                const totalHoras = parseFloat(this.horasHoy) + parseFloat(this.form.horas || 0)

                if (totalHoras > 8) {
                    this.pendienteGuardar = {
                        ...this.form,
                        avance: this.rangeValue
                    }
                    this.modalInstance.show()
                    return
                }
                await this.enviarActividad()
            } catch (err) {
                toast.warning(h(CustomToast, {
                    title: 'Error al verificar horas',
                    message: 'Ocurrió un problema al validar las horas trabajadas hoy'
                }))
            }
        },
        async confirmarGuardarActividad() {
            await this.enviarActividad()
            this.modalInstance.hide()
        },
        async enviarActividad() {
            try {
                const taskData = {
                    usuario_id: userId,
                    proyecto_id: this.form.project,
                    actividad: this.form.actividad,
                    descripcion: this.form.description,
                    prioridad: this.form.priority,
                    usuario_creador: userId,
                    avance: this.rangeValue,
                    horas: this.form.horas
                }
                const response = await fetch('http://localhost:4000/api/tasks/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
                })
                
                if(!response.ok) {
                    const errorData = await response.json()
                    toast.error(h(CustomToast, {
                        title: 'Error',
                        message: errorData.error || 'No se pudo guardar la actividad'   
                    }))
                    return
                } 
                toast.success(h(CustomToast, {
                    title: 'Actividad guardada'
                }))
                this.refreshNeeded = true
                this.resetForm()
            } catch (error) {
                toast.warning(h(CustomToast, {
                    title: 'Algo salio mal',
                    message: 'Por favor, intenta de nuevo más tarde'
                }))
            }
        },
        async loadActivities() {
            try {
                const res = await fetch(`http://localhost:4000/api/actividades/${userId}`)
                if (!res.ok) throw new Error('Error al obteber actividades') 
                this.tasks = await res.json()
            } catch (error) {
                console.error('Error al cargar actividades:', error.message)
            }
        },
        openActivity(task) {
            console.log('Datos enviados al modal;', task)
            this.selectedActivity = task
            this.showModal = true
        },    
        handleActivityUpdated() {
            this.loadActivities()
            this.showModal = false
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
        initTooltips() {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
            tooltipTriggerList.forEach(el => {
                new Tooltip(el)
            })
        },
        resetForm(){
            this.form = {
                project: '',
                priority: '',
                horas: '',
                rangeValue: '',
                actividad: '',
                description: ''
            }
        },
        async cargarEstadisticas() {
            try  {
                const res = await axios.get(`http://localhost:4000/api/estadisticas/${userId}`)
                this.estadisticas = res.data
            } catch (error) {
                console.error('Error al cargar datos:', error)
            }
        },
        async descargarPDF() {
            const response = await fetch(`http://localhost:4000/api/reporte-semanal/${userId}`)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'Reporte_semanal.pdf'
            a.click()
            window.URL.revokeObjectURL(url)
        }
     },
    computed: {
        paginatedTasks() {
            const start = (this.currentPage - 1) * this.pageSize
            const end = start + this.pageSize
            return this.tasks.slice(start, end)
        },  
        totalPages() {
            return Math.ceil(this.tasks.length / this.pageSize)
        }
    },
    watch: {
        refreshNeeded(nuevoValor) {
            if (nuevoValor) {
                this.loadActivities()
                this.refreshNeeded = false
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


@keyframes hourglass-flip {
    0% { transform: rotate(0deg); }
    50% { transform: rotate(180deg); }
    100% { transform: rotate(360deg); }
}

.spin-hourglass {
    display: inline-block;
    animation: hourglass-flip 25s linear infinite;
}
</style>