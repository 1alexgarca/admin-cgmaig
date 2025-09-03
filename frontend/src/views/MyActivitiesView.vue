<template>
    <div class="content-view">
        <!-- Statistics Cards -->
        <div class="row g-4 mb-5 mt-1">
            <!-- Total Actividades -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-info">
                                <i class="bi bi-journal-text"></i>
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <p class="stats-label mb-1">Actividades totales</p>
                                <h3 class="stats-value mb-0">{{ estadisticas.tareasTotales }}</h3>
                                <small class="text-info">
                                    <i class="bi bi-circle-fill me-1"></i>
                                    Tareas registradas
                                </small>
                            </div>
                        </div>
                        <div class="stats-progress mt-3">
                            <div class="progress-bar bg-info" :style="`width: ${Math.min((estadisticas.tareasTotales / 50) * 100, 100)}%`"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actividades en proceso -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-warning">
                                <i class="bi bi-journal-x"></i>
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <p class="stats-label mb-1">En proceso</p>
                                <h3 class="stats-value mb-0">{{ estadisticas.enProgreso }}</h3>
                                <small class="text-warning">
                                    <i class="bi bi-arrow-up me-1"></i>
                                    {{ Math.round((estadisticas.enProgreso / estadisticas.tareasTotales) * 100) || 0 }}% del total
                                </small>
                            </div>
                        </div>
                        <div class="stats-progress mt-3">
                            <div class="progress-bar bg-warning" :style="`width: ${Math.min((estadisticas.enProgreso / estadisticas.tareasTotales) * 100, 100)}%`"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Horas registradas -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-success">
                                <i class="bi bi-clock-history"></i>
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <p class="stats-label mb-1">Horas registradas</p>
                                <h3 class="stats-value mb-0">{{ horasSemana }} hrs</h3>
                                <small class="text-success">
                                    <i class="bi bi-circle-fill me-1"></i>
                                    {{ horaDia }} hrs en el día
                                </small>
                            </div>
                        </div>
                        <div class="stats-progress mt-3">
                            <div class="progress-bar bg-success" :style="`width: ${Math.min((horasSemana / 40) * 100, 100)}%`"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="d-flex flex-column flex-lg-row gap-4">
            <!-- Table Section -->
            <div class="table-section flex-grow-1">
                <div class="table-container">
                    <div class="table-header p-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="table-title mb-0">
                                <i class="bi bi-list-task me-2"></i>
                                {{ weekTitle }}
                            </h5>
                            <div class="d-flex align-items-center gap-2">
                                <select class="form-select form-select-sm" v-model="selectedDayStart">
                                    <option v-for="day in daysInMonth" :key="day" :value="day">{{ day }}</option>
                                </select>
                                <i class="bi bi-arrow-right text-muted"></i>
                                <select class="form-select form-select-sm" v-model="selectedDayEnd">
                                    <option v-for="day in daysInMonth" :key="day" :value="day">{{ day }}</option>
                                </select>
                                <select class="form-select form-select-sm" v-model="selectedMonth">
                                    <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-header-bg">
                                <tr>
                                    <th scope="col" class="table-th">
                                        <div class="th-content">
                                            <i class="bi bi-circle me-2"></i>
                                            Estado
                                        </div>
                                    </th>
                                    <th scope="col" class="table-th">
                                        <div class="th-content">
                                            <i class="bi bi-card-heading me-2"></i>
                                            Actividad
                                        </div>
                                    </th>
                                    <th scope="col" class="table-th">
                                        <div class="th-content">
                                            <i class="bi bi-text-paragraph me-2"></i>
                                            Descripción
                                        </div>
                                    </th>
                                    <th scope="col" class="table-th">
                                        <div class="th-content">
                                            <i class="bi bi-flag me-2"></i>
                                            Prioridad
                                        </div>
                                    </th>
                                    <th scope="col" class="table-th">
                                        <div class="th-content">
                                            <i class="bi bi-graph-up me-2"></i>
                                            Avance
                                        </div>
                                    </th>
                                    <th scope="col" class="table-th">
                                        <div class="th-content">
                                            <i class="bi bi-clock me-2"></i>
                                            Hrs Trabajadas
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr 
                                    v-for="task in paginatedFilteredTasks" 
                                    :key="task.id_activities" 
                                    @click="openActivity(task)"
                                    class="table-row"
                                >
                                    <td class="table-cell text-center">
                                        <i v-if="task.avance === 100" class="bi bi-check-circle-fill text-success fs-5" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Completado"></i>
                                        <i v-else class="bi bi-hourglass-split text-warning fs-5 spin-hourglass" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="En proceso"></i>
                                    </td>
                                    <td class="table-cell">
                                        <div class="text-truncate" style="max-width: 120px;">
                                            {{ task.actividad }}
                                        </div>
                                    </td>
                                    <td class="table-cell">
                                        <div class="text-truncate" style="max-width: 160px;">
                                            {{ task.descripcion }}
                                        </div>
                                    </td>
                                    <td class="table-cell text-center">
                                        <span 
                                            :class="badgePriority(task.prioridad)"
                                            class="badge d-flex justify-content-center align-items-center"
                                            style="height: 24px;"
                                        >
                                            {{ task.prioridad }}
                                        </span>
                                    </td>
                                    <td class="table-cell text-center">
                                        <div class="progress" style="height: 8px; width: 60px; margin: 0 auto;">
                                            <div 
                                                class="progress-bar" 
                                                :class="{
                                                    'bg-success': task.avance === 100,
                                                    'bg-info': task.avance < 100
                                                }" 
                                                :style="`width: ${task.avance}%`"
                                            ></div>
                                        </div>
                                        <small class="text-muted mt-1">{{ task.avance }}%</small>
                                    </td>
                                    <td class="table-cell text-center">
                                        <span class="fw-semibold">{{ task.horas_trabajadas }} hrs</span>
                                    </td>
                                </tr>
                                <tr v-if="paginatedFilteredTasks.length === 0">
                                    <td colspan="6" class="text-center py-4">
                                        <div class="empty-state-table">
                                            <div class="empty-content">
                                                <div class="empty-icon">
                                                    <i class="bi bi-inbox display-4"></i>
                                                </div>
                                                <h5 class="empty-title">No hay actividades registradas</h5>
                                                <p class="empty-description">
                                                    No se encontraron actividades para el período seleccionado
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="table-footer p-4" v-if="paginatedFilteredTasks.length > 0">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="pagination-info">
                                <span class="text-muted">
                                    Mostrando {{ paginatedFilteredTasks.length }} de {{ filteredByWeekAndDate.length }} actividades
                                </span>
                            </div>
                            <nav aria-label="Paginación de actividades">
                                <ul class="pagination pagination-modern mb-0">
                                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                        <a class="page-link" href="#" @click.prevent="currentPage--" aria-label="Anterior">
                                            <i class="bi bi-chevron-left"></i>
                                        </a>
                                    </li>
                                    <li 
                                        v-for="page in Math.ceil(filteredByWeekAndDate.length / pageSize)"
                                        :key="page"
                                        :class="{ active: currentPage === page }"
                                        class="page-item"
                                    >
                                        <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                                    </li>
                                    <li class="page-item" :class="{ disabled: currentPage === Math.ceil(filteredByWeekAndDate.length / pageSize) }">
                                        <a class="page-link" href="#" @click.prevent="currentPage++" aria-label="Siguiente">
                                            <i class="bi bi-chevron-right"></i>
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Section -->
            <div class="form-section">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-transparent border-0 pt-4 pb-0">
                        <h5 class="card-title fw-bold">
                            <i class="bi bi-plus-circle me-2"></i>
                            Registrar actividad
                        </h5>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="handleSubmit">
                            <div class="mb-3">
                                <label class="form-label">Proyecto</label>
                                <select v-model="form.project" :class="['form-select', errors.project && 'is-invalid']">
                                    <option value="" disabled selected>Seleccione el proyecto</option>
                                    <option v-for="project in projects" :key="project.id_project" :value="project.id_project">
                                        {{ project.name_project }}
                                    </option>
                                </select>
                                <div class="invalid-feedback" v-if="errors.project">{{ errors.project }}</div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Nombre de la actividad</label>
                                <input v-model="form.actividad" type="text" class="form-control" placeholder="Ingrese el nombre de la actividad">
                                <div class="invalid-feedback" v-if="errors.actividad">{{ errors.actividad }}</div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Prioridad</label>
                                <div class="d-flex gap-2" :class="{ 'is-invalid': errors.priority }">
                                    <div class="priority-option" :class="{ 'priority-high': form.priority === 'Alta' }" @click="form.priority = 'Alta'">
                                        <input v-model="form.priority" type="radio" name="priority" id="priorityHigh" value="Alta" class="d-none">
                                        <label for="priorityHigh" class="mb-0">Alta</label>
                                    </div>
                                    
                                    <div class="priority-option" :class="{ 'priority-medium': form.priority === 'Media' }" @click="form.priority = 'Media'">
                                        <input v-model="form.priority" type="radio" name="priority" id="priorityMedium" value="Media" class="d-none">
                                        <label for="priorityMedium" class="mb-0">Media</label>
                                    </div>
                                    
                                    <div class="priority-option" :class="{ 'priority-low': form.priority === 'Baja' }" @click="form.priority = 'Baja'">
                                        <input v-model="form.priority" type="radio" name="priority" id="priorityLow" value="Baja" class="d-none">
                                        <label for="priorityLow" class="mb-0">Baja</label>
                                    </div>
                                </div>
                                <div class="invalid-feedback d-block" v-if="errors.priority">{{ errors.priority }}</div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Descripción</label>
                                <textarea v-model="form.description" class="form-control" rows="3" placeholder="Describa la actividad"></textarea>
                                <div class="invalid-feedback" v-if="errors.description">{{ errors.description }}</div>
                            </div>

                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label class="form-label">Avance de la actividad</label>
                                    <div class="d-flex align-items-center gap-3">
                                        <input 
                                            class="form-range flex-grow-1"
                                            type="range"
                                            v-model="rangeValue"
                                            min="0"
                                            max="100"
                                        />
                                        <span class="fw-bold text-primary">{{ rangeValue }}%</span>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Horas Trabajadas</label>
                                    <input 
                                        type="number"
                                        v-model="form.horas"
                                        class="form-control"
                                        step="0.1"
                                        min="0"
                                        placeholder="0.0">
                                    <div class="invalid-feedback" v-if="errors.horas">{{ errors.horas }}</div>
                                </div>
                            </div>

                            <div class="text-end mt-4">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-circle me-2"></i>
                                    Registrar actividad
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
import dayjs from 'dayjs';
import 'dayjs/locale/es'
import isoWeek from 'dayjs/plugin/isoWeek'
import isoBetween from 'dayjs/plugin/isBetween'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isoWeek)
dayjs.extend(isoBetween)
dayjs.extend(customParseFormat)
dayjs.locale('es')
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

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
            },
            selectedDayStart: null,
            selectedDayEnd: null,
            selectedMonth: null,
            selectedYear: null,
            daysInMonth: [],
            months: [
                "Ene", "Feb", "Mar", "Abr", "May", "Jun",
                "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
            ],
            years: []

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
        const today = dayjs()
        const currentYear = today.year()
        this.years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

        this.selectedYear = currentYear
        this.selectedMonth = today.month() + 1
        this.loadDaysInMonth()
        this.selectedDay = today.date()
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
                    prioridad: this.priority,
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
        loadDaysInMonth() {
            const days = dayjs(`${this.selectedYear}-${this.selectedMonth}-01`).daysInMonth()
            this.daysInMonth = Array.from({ length: days }, (_, i) => i + 1)
        }
     },
    computed: {
        paginatedTasks() {
            const start = (this.currentPage - 1) * this.pageSize
            const end = start + this.pageSize
            return this.tasks.slice(start, end)
        },  
        filteredByWeekAndDate() {
            let taskFiltered = []

            try{
                if (this.selectedDayStart && this.selectedDayEnd && this.selectedMonth && this.selectedYear) {
                    const startDate = dayjs(`${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDayStart).padStart(2, '0')}`)
                    const endDate = dayjs(`${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDayEnd).padStart(2, '0')}`)

                    taskFiltered = this.tasks.filter(task => {
                        try {
                            const taskDate = dayjs(task.fecha_creacion)
                            if (!taskDate.isValid()) throw new Error('Fecha inválida') 
                            return taskDate.isSameOrAfter(startDate) && taskDate.isSameOrBefore(endDate)
                        } catch (error) {
                            console.error('Error filtrando tarea:', task, error)
                            return false
                        }
                    })
                } else {
                    const today = dayjs()
                    const startWeek = today.startOf('isoWeek')
                    const endWeek = today.endOf('isoWeek')

                    taskFiltered = this.tasks.filter(task => {
                        try {
                            const taskDate = dayjs(task.fecha_creacion)
                            if (!taskDate.isValid()) throw new Error('Fecha inválida')
                            return taskDate.isSameOrAfter(startWeek) && taskDate.isSameOrBefore(endWeek)
                        } catch (error) {

                            console.error('Error filtrando actividades:', task, error)
                            return false
                        }
                    })
                }
                console.log('Tareas filtradas:', taskFiltered.length)
                return taskFiltered
            } catch (error) {
                console.error('Error en filteredByWeekAndDate:', error)
                return []
            }
        },
        paginatedFilteredTasks() {
            const start = (this.currentPage -1) * this.pageSize
            const end = start + this.pageSize
            return this.filteredByWeekAndDate.slice(start, end)
        },
        totalPages() {
            return Math.ceil(this.tasks.length / this.pageSize)
        },
        weekTitle() {
            const monthNames = [
                "enero", "febrero", "marzo", "abril", "mayo", "junio",
                "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
            ]

            if (this.selectedDayStart && this.selectedDayEnd && this.selectedMonth && this.selectedYear) {
                const startDate = dayjs(`${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDayStart).padStart(2, '0')}`)
                const endDate = dayjs(`${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDayEnd).padStart(2, '0')}`)
                
                return `Actividades del ${startDate.date()} al ${endDate.date()} de ${monthNames[endDate.month()]} ${endDate.year()}`
            }
            const today = dayjs()
            const startOfWeek = today.startOf('isoWeek')
            const endOfWeek = today.endOf('isoWeek')

            return `Actividades del ${startOfWeek.date()} al ${endOfWeek.date()} de ${monthNames[endOfWeek.month()]} ${endOfWeek.year()}`
        },
        horaDia() {
            const hoy = dayjs().format('YYYY-MM-DD')
            return this.tasks.reduce((total, task) => {
                const fecha = dayjs(task.fecha_creacion).format('YYYY-MM-DD')
                return fecha === hoy ? total + (parseFloat(task.horas_trabajadas) || 0) : total
            }, 0)
        },
        horasSemana() {
            const inicioSemana = dayjs().startOf('isoWeek')
            const finSemana = dayjs().endOf('isoWeek')
            return this.tasks.reduce((total, task) => {
                const fecha = dayjs(task.fecha_creacion)
                if (fecha.isSameOrAfter(inicioSemana) && fecha.isSameOrBefore(finSemana)) {
                    return total + (parseFloat(task.horas_trabajadas) || 0)
                }
                return total
            }, 0)
        }
    
    },
    watch: {
        refreshNeeded(nuevoValor) {
            if (nuevoValor) {
                this.loadActivities()
                this.refreshNeeded = false
            }
        },
        selectedMonth() {
            this.loadDaysInMonth()
            if(this.selectedDayStart > this.daysInMonth.length) this.selectedDayStart = this.daysInMonth.length
            if(this.selectedDayEnd > this.daysInMonth.length) this.selectedDayEnd = this.daysInMonth.length
        },
        selectedYear() {
            this.loadDaysInMonth()
        },
        selectedDayStart() {
            this.currentPage = 1
        },
        selectedDayEnd() {
            this.currentPage = 1
        }
    }
}
</script>

<style scoped>
/* Variables CSS */
:root {
    --primary-color: #3b82f6;
    --primary-light: #dbeafe;
    --success-color: #10b981;
    --success-light: #d1fae5;
    --warning-color: #f59e0b;
    --warning-light: #fef3c7;
    --info-color: #06b6d4;
    --info-light: #cffafe;
    --danger-color: #ef4444;
    --danger-light: #fee2e2;
    --secondary-color: #6b7280;
    --light-bg: #f8fafc;
    --border-color: #e5e7eb;
    --border-radius: 12px;
    --border-radius-sm: 8px;
    --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --transition: all 0.3s ease;
}

/* Content View */
.content-view {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
    padding: 2rem;
}

/* Statistics Cards */
.stats-card {
    border-radius: var(--border-radius);
    transition: var(--transition);
    background: white;
    overflow: hidden;
}

.stats-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--box-shadow-lg);
}

.stats-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    flex-shrink: 0;
}

.stats-icon.bg-primary { background: var(--primary-color); }
.stats-icon.bg-success { background: var(--success-color); }
.stats-icon.bg-warning { background: var(--warning-color); }
.stats-icon.bg-info { background: var(--info-color); }

.stats-label {
    font-size: 0.875rem;
    color: var(--secondary-color);
    font-weight: 500;
    margin-bottom: 0;
}

.stats-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
}

.stats-progress {
    height: 4px;
    background-color: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s ease;
}

/* Table Section */
.table-section {
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    overflow: hidden;
}

.table-container {
    background: white;
    border-radius: var(--border-radius);
}

.table-header {
    background: linear-gradient(135deg, var(--light-bg) 0%, #f1f5f9 100%);
    border-bottom: 1px solid var(--border-color);
}

.table-title {
    font-weight: 700;
    color: #1e293b;
}

.table-header-bg {
    background: var(--light-bg);
    border-bottom: 2px solid var(--border-color);
}

.table-th {
    border: none;
    padding: 1rem 1.5rem;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.th-content {
    display: flex;
    align-items: center;
}

.table-row {
    transition: var(--transition);
    border: none;
}

.table-row:hover {
    background-color: var(--light-bg);
    transform: scale(1.01);
}

.table-cell {
    padding: 1rem 1.5rem;
    vertical-align: middle;
    border: none;
    border-bottom: 1px solid #f1f5f9;
}

/* Form Section */
.form-section {
    width: 40%;
}

.form-section .card {
    border-radius: var(--border-radius);
}

/* Priority Options */
.priority-option {
    height: 2.5rem;
    width: 100%;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
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

/* Empty State */
.empty-state-table {
    padding: 2rem 1rem;
    text-align: center;
}

.empty-content {
    max-width: 300px;
    margin: 0 auto;
}

.empty-icon i {
    font-size: 3rem;
    color: #d1d5db;
}

.empty-title {
    color: #374151;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
}

.empty-description {
    color: var(--secondary-color);
    margin-bottom: 1rem;
}

/* Table Footer */
.table-footer {
    background: var(--light-bg);
    border-top: 1px solid var(--border-color);
}

.pagination-info {
    color: var(--secondary-color);
    font-size: 0.9rem;
}

.pagination-modern .page-link {
    border: 1px solid var(--border-color);
    color: var(--secondary-color);
    padding: 0.5rem 0.75rem;
    margin: 0 0.125rem;
    border-radius: var(--border-radius-sm);
    transition: var(--transition);
}

.pagination-modern .page-item.active .page-link {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

.pagination-modern .page-link:hover {
    background: var(--primary-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
}

/* Badge Styles */
.badge {
    font-weight: 600;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
}

.bg-primary-subtle { background-color: var(--primary-light) !important; }
.bg-success-subtle { background-color: var(--success-light) !important; }
.bg-warning-subtle { background-color: var(--warning-light) !important; }

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.stats-card,
.table-section,
.form-section .card {
    animation: fadeInUp 0.6s ease forwards;
}

.stats-card:nth-child(2) { animation-delay: 0.1s; }
.stats-card:nth-child(3) { animation-delay: 0.2s; }

.table-row {
    animation: fadeInUp 0.4s ease forwards;
}

.table-row:nth-child(odd) { animation-delay: 0.1s; }
.table-row:nth-child(even) { animation-delay: 0.15s; }

@keyframes hourglass-flip {
    0% { transform: rotate(0deg); }
    50% { transform: rotate(180deg); }
    100% { transform: rotate(360deg); }
}

.spin-hourglass {
    display: inline-block;
    animation: hourglass-flip 25s linear infinite;
}

/* Responsive Design */
@media (max-width: 992px) {
    .content-view {
        padding: 1rem;
    }
    
    .d-flex {
        flex-direction: column;
    }
    
    .form-section {
        width: 100%;
        margin-left: 0;
        margin-top: 1rem;
    }
    
    .stats-icon {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
    }
    
    .stats-value {
        font-size: 1.5rem;
    }
    
    .table-th,
    .table-cell {
        padding: 0.75rem;
        font-size: 0.875rem;
    }
}

@media (max-width: 768px) {
    .table-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .table-title {
        font-size: 1.1rem;
    }
    
    .priority-options {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .priority-option {
        width: 100%;
    }
}

@media (max-width: 576px) {
    .stats-card:hover,
    .table-row:hover {
        transform: none;
    }
    
    .table-responsive {
        font-size: 0.8rem;
    }
    
    .pagination-modern {
        justify-content: center;
    }
    
    .pagination-modern .page-link {
        padding: 0.375rem 0.5rem;
        font-size: 0.875rem;
    }
}
</style>