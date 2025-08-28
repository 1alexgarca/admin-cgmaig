<template>
    <div class="content-view">
        <!-- Statistics Cards -->
        <div class="row g-4 mb-5 mt-1">
            <!-- Total Usuarios -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-primary">
                                <i class="bi bi-people-fill"></i>
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <p class="stats-label mb-1">Tus Asignaciones</p>
                                <h3 class="stats-value mb-0">{{ asignacionesActuales }}</h3>
                                <small :class="{'text-success': cambioSemanal >= 0, 'text-danger': cambioSemanal < 0}">
                                    <i :class="{
                                        'bi': true,
                                        'bi-arrow-up': cambioSemanal >= 0,
                                        'bi-arrow-down': cambioSemanal < 0
                                    }"></i>
                                    {{ Math.abs(cambioSemanal) }}% VS la semana pasada
                                </small>
                            </div>
                        </div>
                        <!-- <div class="stats-progress mt-3">
                            <div class="progress-bar bg-primary" :style="`width: ${Math.min((totalUsers / 100) * 100, 100)}%`"></div>
                        </div> -->
                    </div>
                </div>
            </div>

            <!-- Nuevos Usuarios -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-success">
                                <i class="bi bi-person-plus"></i>
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <p class="stats-label mb-1">Próximas a vencer</p>
                                <h3 class="stats-value mb-0">{{ vencenHoy }}</h3>
                                 <small :class="{'text-warning': vencenHoy > 0, 'text-muted': vencenHoy === 0}">
                                    <i :class="{
                                        'bi': true,
                                        'bi-arrow-down': vencenHoy > 0,
                                        'bi-check-circle': vencenHoy === 0
                                    }"></i>
                                    {{ vencenHoy > 0 ? 'Vencen hoy' : 'No hay tareas por vencer' }}
                                </small>
                            </div>
                        </div>
                        <!-- <div class="stats-progress mt-3">
                            <div class="progress-bar bg-success" :style="`width: ${Math.min(porcentajeSemana, 100)}%`"></div>
                        </div> -->
                    </div>
                </div>
            </div>

            <!-- Tareas vencidas -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-warning">
                                <i class="bi bi-calendar-day"></i>
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <p class="stats-label mb-1">Vencidas</p>
                                <h3 class="stats-value mb-0">{{ vencidas }}</h3>
                                <span class="badge bg-warning-subtle text-warning">
                                    <i class="bi bi-clock-fill"></i> Tareas vencidas sin terminar
                                </span>
                            </div>
                        </div>
                        <!-- <div class="stats-progress mt-3">
                            <div class="progress-bar bg-warning" :style="`width: ${Math.min((nuevosHoy / 5) * 100, 100)}%`"></div>
                        </div> -->
                    </div>
                </div>
            </div>

        </div>

        <!-- Search and Controls Section -->
        <div class="controls-section mb-4">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <div class="search-wrapper">
                        <i class="bi bi-search search-icon"></i>
                        <input
                            type="search"
                            class="form-control search-input"
                            placeholder="Buscar usuarios o actividades..."
                            v-model="searchQuery">
                    </div>
                </div>
                <div class="col-md-6 text-md-end mt-3 mt-md-0">
                    <div class="control-buttons">
                        <button class="btn btn-outline-secondary" @click="showModal = true">
                            <i class="bi bi-node-plus"></i>
                            Asignar Actividad
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Users Table Section -->
        <div class="table-section">
            <div class="table-container">
                <div class="table-responsive">
                    <table class="table table-striped border rounded-4 table-sm">
                        <thead>
                            <tr>
                                <th colspan="6">
                                    <h6 class="fw-bold">
                                        {{ weekTitle }}
                                    </h6>
                                </th>
                                <th colspan="4">
                                    <div class="d-flex justify-content-around align-items-center p-1">
                                        <select class="form-select form-select-sm" v-model="selectedDayStart">
                                            <option v-for="day in daysInMonth" :key="day" :value="day">{{ day }}</option>
                                        </select>
                                        <i class="bi bi-arrow-right-circle ps-2 pe-2"></i>
                                        <select class="form-select form-select-sm" v-model="selectedDayEnd">
                                        <option v-for="day in daysInMonth" :key="day" :value="day">{{ day }}</option>
                                        </select>
                                        <select class="form-select form-select-sm" v-model="selectedMonth">
                                            <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
                                        </select>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <thead class="small"> 
                            <tr class="fw-medium">
                                <th scope="col" class="w-15">Asignado</th>
                                <th scope="col" class="w-20">Proyecto</th>
                                <th scope="col" class="w-20">Actividad</th>
                                <th scope="col" class="w-20">Descripción</th>
                                <th scope="col" class="w-5 text-center">Horas</th>
                                <th scope="col" class="w-5 text-center">Avance</th>
                                <th scope="col" class="w-10">Registro</th>
                                <th scope="col" class="w-10">Finalización</th>
                                <th scope="col" class="w-5">Prioridad</th>
                                <th scope="col" class="w-10">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="small"> <!-- Texto más pequeño en contenido -->
                            <tr v-for="task in paginatedFilteredTasks" :key="task.id_activities" :class="{'table-danger': isVencida(task)}">
                                <td>{{ task.nombre_asignado }} {{ task.paterno_asignado }} {{ task.materno_asignado }}</td> 
                                <td class="text-truncate" style="max-width: 190px;">{{ task.proyecto }}</td> 
                                <td class="text-truncate" style="max-width: 190px;">{{ task.actividad }}</td> 
                                <td class="text-truncate" style="max-width: 190px;">{{ task.descripcion }}</td> 
                                <td class="text-center">{{ task.horas_trabajadas }}</td> 
                                <td class="text-center" style="max-width: 190px;">
                                    <div class="progress" style="height: 20px; max-width: 170px;">
                                        <div class="progress-bar bg-success text-center" role="progressbar" :style="{ width: task.avance + '%' }" aria-valuenow="50" aria-valuemin="50" aria-valuemax="100">{{ task.avance }}</div>
                                    </div>
                                </td> 
                                <td>{{ task.creation }}</td> 
                                <td>
                                    <i v-if="isVencida(task)"
                                        class="bi bi-exclamation-triangle-fill text-danger me-1"
                                        title="Tarea vencida"
                                    ></i>
                                    {{ task.limited }}
                                </td> 
                                <td>
                                    <i 
                                      class="bi bi-flag-fill"
                                      :class="{
                                        'text-danger': task.prioridad === 'alta',
                                        'text-warning': task.prioridad === 'media',
                                        'text-success': task.prioridad === 'baja'
                                      }"  
                                    ></i>
                                    <span style="height: 20px; width: 60px;" class="ms-1"
                                    :class="{
                                        'text-danger fw-bold': task.prioridad === 'alta',
                                        'text-warning fw-bold': task.prioridad === 'media',
                                        'text-success fw-bold': task.prioridad === 'baja'
                                    }"
                                    >
                                        {{ task.prioridad }}
                                    </span>
                                </td> 
                                <td>
                                    <button @click="editTask(task)" type="button" class="btn btn-sm btn-outline-info me-1"><i class="bi bi-pencil-square"></i></button> 
                                    <button @click="deleteTask(task)" type="button" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                                </td> 
                            </tr>
                            <tr v-if="tasks.length === 0">
                                <td colspan="10" class="text-center">No hay registros</td> 
                            </tr>
                        </tbody>
                    </table>
                    <div class="d-flex justify-content-center mt-4">
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
                    </div>
                </div>
            </div>
        </div>
    </div>

    <TaskModal 
        :show="showModal"
        @close="showModal = false"
        @submit="TaskAdd"
    />

    <TaskPModal
        :show="showUpdate"
        :initialData="selectedTask"
        @close="showUpdate = false"
        @saved="TaskUp"
    />

    <TaskDModal
        :show="ShowDelete"
        :initialData="delTask"
        @close="ShowDelete = false"
        @saved="TaskDel"
    />
</template>

<script>
import TaskModal from '../components/TaskModal.vue';
import TaskPModal from '@/components/TaskPModal.vue';
import TaskDModal from '@/components/TaskDModal.vue';
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

const user = JSON.parse(localStorage.getItem('user'))
const idUser = user?.id
// console.log('Usuario creador:', idUser)

export default {
    name: 'Assignment',
    components: {
        TaskModal,
        TaskPModal,
        TaskDModal
    },
    data() {
        return {
            showModal: false,
            showUpdate: false,
            ViewDelete: false,
            ShowDelete: false,
            tasks: [],
            selectedTask: {},
            delTask: {},
            vencenHoy: 0,
            showDetails: false,
            searchQuery: '',
            currentPage: 1,
            pageSize: 10,
            
            selectedDayStart: null,
            selectedDayEnd: null,
            selectedMonth: null,
            selectedYear: null,
            daysInMonth: [],
            months: [
                "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
                "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" 
            ],
            years: [],
        };
    },
    computed:{
        filteredTasks() {
            if (!this.searchQuery) return this.tasks

            const query = this.searchQuery.toLocaleLowerCase()

            return this.tasks.filter(task => {
                const asignado = `${task.nombre_asignado} ${task.paterno_asignado} ${task.materno_asignado}`.toLowerCase()
                const proyecto = (task.proyecto || '').toLowerCase()
                const actividad = (task.actividad || '').toLowerCase()
                const descripcion = (task.descripcion || '').toLowerCase()
                const prioridad = (task.prioridad || '').toLowerCase()

                return (
                    asignado.includes(query) ||
                    proyecto.includes(query) ||
                    actividad.includes(query) ||
                    descripcion.includes(query) ||
                    prioridad.includes(query)
                )
            })
        },
        today() {
            const hoy = new Date();
            const year = hoy.getFullYear();
            const month = String(hoy.getMonth() + 1).padStart(2, '0'); // Meses de 0 a 11
            const day = String(hoy.getDate()).padStart(2, '0'); // Días del mes
            // return `${year}-${month}-${day}`;
            return `${day}/${month}/${year}`; // Formato YYYY-MM-DD
        },
        todayDate() {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); // Aseguramos que la hora sea 00:00:00
            return hoy;
        },
        vencidas() {
        return this.tasks.filter(task => {
            if (!task.limited) return false;
            const [dd, mm, yyyy] = task.limited.split('/');
            const fechaLim = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
            fechaLim.setHours(0, 0, 0, 0);

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            return fechaLim.getTime() < hoy.getTime() && task.avance < 100; // Tareas vencidas y no completadas
        }).length;
        },
        asignacionesActuales() {
            const user = JSON.parse(localStorage.getItem('user'));
            return this.tasks.filter(task => task.usuario_creador === user?.id).length
        },
        cambioSemanal() {
            const semanaPasada = 100
            const actuales = this.asignacionesActuales

            if (semanaPasada === 0) return 100
            const cambio = ((actuales - semanaPasada) / semanaPasada) * 100
            return Math.round(cambio)
        },
        paginatedTasks() {
            const start = (this.currentPage - 1) * this.pageSize
            const end = start + this.pageSize
            return this.tasks.slice(start, end)
        },
        filteredByWeekAndDate() {
            let tasksFiltered = []

            try {
                // Si hay inputs seleccionados, filtramos por rango de fechas
                if (this.selectedDayStart && this.selectedDayEnd && this.selectedMonth && this.selectedYear) {
                    const startDate = dayjs(`${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDayStart).padStart(2, '0')}`)
                    const endDate = dayjs(`${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDayEnd).padStart(2, '0')}`)

                    tasksFiltered = this.tasks.filter(task => {
                        try {
                            const taskDate = dayjs(task.creation_raw)
                            if (!taskDate.isValid()) throw new Error('Fecha inválida')
                            return taskDate.isSameOrAfter(startDate) && taskDate.isSameOrBefore(endDate)
                        } catch (error) {
                            console.error('Error filtrando tarea:', task, error)
                            return false
                        }
                    })
                } else {
                    // Si no hay inputs, filtramos por semana actual
                    const today = dayjs()
                    const startWeek = today.startOf('isoWeek')
                    const endWeek = today.endOf('isoWeek')

                    tasksFiltered = this.tasks.filter(task => {
                        try {
                            const taskDate = dayjs(task.creation_raw)
                            if (!taskDate.isValid()) throw new Error('Fecha inválida')
                            return taskDate.isSameOrAfter(startWeek) && taskDate.isSameOrBefore(endWeek)
                        } catch (error) {
                            console.error('Error filtrando tarea:', task, error)
                            return false
                        }
                    })
                }

                console.log('Tareas filtradas:', tasksFiltered.length)
                return tasksFiltered

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
            return Math.ceil(this.filteredByWeekAndDate.length / this.pageSize)
        },
        weekTitle() {
            const monthNames = [
                "enero", "febrero", "marzo", "abril", "mayo", "junio",
                "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
                ]

                // Caso 1: rango seleccionado
                if (this.selectedDayStart && this.selectedDayEnd && this.selectedMonth && this.selectedYear) {
                const startDate = dayjs(`${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDayStart).padStart(2, '0')}`)
                const endDate = dayjs(`${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDayEnd).padStart(2, '0')}`)

                return `Actividades de la semana del ${startDate.date()} al ${endDate.date()} de ${monthNames[endDate.month()]} ${endDate.year()}`
                }

                // Caso 2: semana actual
                const today = dayjs()
                const startOfWeek = today.startOf('isoWeek')
                const endOfWeek = today.endOf('isoWeek')

                return `Actividades de la semana del ${startOfWeek.date()} al ${endOfWeek.date()} de ${monthNames[endOfWeek.month()]} ${endOfWeek.year()}`
            }
    },

    methods: {
        viewDetails(task) {
            this.selectedTask = task,
            this.showDetails = true 
        },
        deleteDetais(task){
            this.delTask = task,
            this.ViewDelete = true
        },
        async loadTask() {
            try {
                const res = await fetch(`http://localhost:4000/api/tasks/${idUser}`)
                if (!res.ok) throw new Error('Error al obtener usuarios')
                this.tasks = await res.json()
                this.proximasVencer()
                // this.filterThisWeek()
            } catch (error) {
                console.error('Error al cargar tareas:', error.message)
            }
        },
        Asignar() {
            console.log('Asignar nueva tarea');
            this.showModal = false;
        },
        TaskAdd(newTask) {
            if (newTask && newTask.name) {
                this.tasks.push(newTask)
            } else {
                this.loadTask()
            }
        },
        proximasVencer(){
            this.vencenHoy = this.tasks.filter(task => task.limited === this.today).length;
            // console.log('Tareas que vencen hoy:', this.vencenHoy);
        },
        editTask(task) {
            this.selectedTask = {
                id: task.id_activities,
                asignado: `${task.nombre_asignado} ${task.paterno_asignado} ${task.materno_asignado}`,
                proyecto: task.proyecto,
                actividad: task.actividad,
                descripcion: task.descripcion,
                trabajadas: task.horas_trabajadas,
                avance: task.avance,
                fecha_fin: task.limited,
                prioridad: task.prioridad
            }
            console.log('Datos eviados:', this.selectedTask)
            this.showUpdate = true
        },
        deleteTask(task) {
            this.delTask = {
                id: task.id_activities,
                asignado: `${task.nombre_asignado} ${task.paterno_asignado} ${task.materno_asignado}`,
                proyecto: task.proyecto,
                actividad: task.actividad,
                descripcion: task.descripcion,
                trabajadas: task.horas_trabajadas,
                avance: task.avance,
                fecha_fin: task.limited,
                prioridad: task.prioridad
            }
            console.log('Datos enviados para eliminar:', this.delTask)
            this.ShowDelete = true
        },
        TaskUp(updatedTask){
            console.log('Proyecto recibido:', updatedTask)

            const index =  this.tasks.findIndex(
                task => task.id_activities == updatedTask.id
            )

            if (index !== -1) {
                this.tasks[index] = {
                    ...this.tasks[index],
                    ...updatedTask
                }
            }
            this.showUpdate = false
        },
        TaskDel(deletedTask) {
            console.log('Actividad eliminada:', deletedTask)
            const index = this.tasks.findIndex(
                task => task.id_activities == deletedTask
            )
            if (index !== -1) {
                this.tasks.splice(index, 1)
            }
            history.ShowDelete = false
        },
        isVencida(task) {
            if (!task.limited) return false

            const [dd, mm, yyyy] = task.limited.trim().split('/')
            // Creamos la fecha manualmente sin pasar por el constructor de strings
            const fechaLim = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
            fechaLim.setHours(0, 0, 0, 0)

            const hoy = new Date()
            hoy.setHours(0, 0, 0, 0)

            return fechaLim.getTime() < hoy.getTime() && task.avance < 100
        },
        loadDaysInMonth() {
            const days = dayjs(`${this.selectedYear}-${this.selectedMonth}-01`).daysInMonth()
            this.daysInMonth = Array.from({ length: days }, (_, i) => i + 1)

        }
    },
    mounted() {
        this.$nextTick(() => {
            document.querySelector('.table-responsive').addEventListener('click', (e) => {
                const row = e.target.closest('tbosy, tr');
                if (!row || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
                row.classList.toggle('expanded');
            })
        })

        const today = dayjs()
        const currentYear = today.year()
        this.years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

        this.selectedYear = currentYear
        this.selectedMonth = today.month() + 1
        this.loadDaysInMonth()
        this.selectedDay = today.date()
    },
    created() {
        this.loadTask()
    },
    watch: {
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
    
};


document.querySelectorAll('tbody tr').forEach(row => {
    row.addEventListener('click', (e) => {
        // Evita activarse al hacer clic en botones
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        
        // Alternar clase 'expanded' en la fila clickeada
        row.classList.toggle('expanded');
        
        // Opcional: Restaurar tooltip si existe
        const truncatedCells = row.querySelectorAll('.text-truncate');
        truncatedCells.forEach(cell => {
            if (row.classList.contains('expanded')) {
                cell.setAttribute('title', ''); // Oculta tooltip al expandir
            } else {
                cell.setAttribute('title', cell.dataset.fulltext); // Restaura tooltip
            }
        });
    });
});


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

tr.expanded td.text-truncate {
    white-space: normal; /* Permite que el texto se ajuste a varias líneas */
    overflow: visible; /* Asegura que el texto no se corte */
    max-width: none; /* Permite que el texto ocupe todo el ancho disponible */
}

tr.expanded .expand-icon {
    transform: rotate(90deg);
    transition: transform 0.2s;
}

tbody tr{
    cursor: pointer;
    transition: background-color 0.2s;
}

tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.02);
}

/* Content View */
.content-view {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
    padding: 2rem;
}

/* Header Section */
.header-section {
    background: white;
    border-radius: var(--border-radius);
    padding: 2rem;
    box-shadow: var(--box-shadow);
    margin-bottom: 2rem;
}

.page-title {
    font-weight: 700;
    color: #1e293b;
    font-size: 2rem;
}

.page-subtitle {
    font-size: 1.1rem;
    margin-bottom: 0;
}

/* Gradient Button */
.btn-gradient-primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%);
    border: none;
    border-radius: var(--border-radius);
    color: white;
    font-weight: 600;
    transition: var(--transition);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-gradient-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    color: white;
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

/* Controls Section */
.controls-section {
    background: white;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: var(--box-shadow);
}

.search-wrapper {
    position: relative;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--secondary-color);
    z-index: 5;
}

.search-input {
    padding-left: 3rem;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: var(--transition);
}

.search-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.control-buttons .btn {
    font-weight: 500;
    transition: var(--transition);
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

/* User Info Styles */
.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), #1d4ed8);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.user-details {
    min-width: 0;
}

.user-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-role {
    font-size: 0.8rem;
}

/* Table Content Styles */
.email-container,
.phone-container,
.date-container {
    display: flex;
    align-items: center;
}

.email-text,
.phone-text,
.date-text {
    color: #374151;
    font-size: 0.9rem;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    width: 35px;
    height: 35px;
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);
    background: white;
    transition: var(--transition);
    font-size: 0.875rem;
}

.btn-edit:hover {
    background: var(--primary-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
}

.btn-delete:hover {
    background: var(--danger-light);
    border-color: var(--danger-color);
    color: var(--danger-color);
    transform: translateY(-2px);
}

.btn-view:hover {
    background: var(--info-light);
    border-color: var(--info-color);
    color: var(--info-color);
    transform: translateY(-2px);
}

/* Empty State */
.empty-state-table {
    padding: 4rem 2rem;
    text-align: center;
}

.empty-content {
    max-width: 400px;
    margin: 0 auto;
}

.empty-icon i {
    font-size: 4rem;
    color: #d1d5db;
}

.empty-title {
    color: #374151;
    font-weight: 600;
    margin: 1.5rem 0 1rem 0;
}

.empty-description {
    color: var(--secondary-color);
    margin-bottom: 2rem;
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

/* Responsive Design */
@media (max-width: 768px) {
    .content-view {
        padding: 1rem;
    }
    
    .header-section {
        padding: 1.5rem;
        text-align: center;
    }
    
    .page-title {
        font-size: 1.5rem;
    }
    
    .stats-icon {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
    }
    
    .stats-value {
        font-size: 1.5rem;
    }
    
    .controls-section {
        padding: 1rem;
    }
    
    .control-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .control-buttons .btn {
        flex: 1;
        min-width: 100px;
    }
    
    .table-th,
    .table-cell {
        padding: 0.75rem;
        font-size: 0.875rem;
    }
    
    .user-info {
        gap: 0.5rem;
    }
    
    .user-avatar {
        width: 35px;
        height: 35px;
        font-size: 0.8rem;
    }
    
    .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .btn-action {
        width: 100%;
        height: 30px;
    }
}

@media (max-width: 576px) {
    .stats-card:hover {
        transform: none;
    }
    
    .table-row:hover {
        transform: none;
    }
    
    .table-responsive {
        font-size: 0.8rem;
    }
    
    .user-name {
        font-size: 0.85rem;
    }
    
    .email-text,
    .phone-text,
    .date-text {
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
.controls-section,
.table-section {
    animation: fadeInUp 0.6s ease forwards;
}

.stats-card:nth-child(2) { animation-delay: 0.1s; }
.stats-card:nth-child(3) { animation-delay: 0.2s; }
.stats-card:nth-child(4) { animation-delay: 0.3s; }

.table-row {
    animation: fadeInUp 0.4s ease forwards;
}

.table-row:nth-child(odd) { animation-delay: 0.1s; }
.table-row:nth-child(even) { animation-delay: 0.15s; }

/* Loading State */
.loading-row {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* Focus States */
.btn-action:focus,
.search-input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Print Styles */
@media print {
    .header-section,
    .controls-section,
    .table-footer {
        background: white !important;
        box-shadow: none !important;
    }
    
    .btn,
    .action-buttons {
        display: none;
    }
    
    .stats-card:hover,
    .table-row:hover {
        transform: none;
    }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
    :root {
        --border-color: #000;
        --secondary-color: #000;
    }
    
    .table-row:hover {
        background-color: #f0f0f0;
    }
    
    .stats-icon {
        border: 2px solid #000;
    }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
    
    .stats-card:hover,
    .table-row:hover,
    .btn-action:hover {
        transform: none;
    }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
    :root {
        --light-bg: #1f2937;
        --border-color: #374151;
        --secondary-color: #9ca3af;
    }
    
    .content-view {
        background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
        color: #f9fafb;
    }
    
    .stats-card,
    .header-section,
    .controls-section,
    .table-section {
        background: #1f2937;
        color: #f9fafb;
    }
    
    .table-header {
        background: #111827;
    }
    
    .table-row:hover {
        background-color: #111827;
    }
    
    .page-title,
    .stats-value,
    .user-name {
        color: #f9fafb;
    }
    
    .search-input {
        background: #111827;
        color: #f9fafb;
        border-color: #374151;
    }
    
    .btn-action {
        background: #111827;
        border-color: #374151;
        color: #f9fafb;
    }
}
</style>