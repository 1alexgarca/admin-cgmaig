<template>
    <div class="content-view">
        <div class="row g-4 mb-4">
            <!-- Card 1: Total Usuarios -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-subtitle mb-2 text-muted">Tus asignaciones</h6>
                            <h3 class="mb-0">{{ asignacionesActuales }}</h3>
                            <small :class="{'text-success': cambioSemanal >= 0, 'text-danger': cambioSemanal < 0}">
                                <i :class="{
                                    'bi': true,
                                    'bi-arrow-up': cambioSemanal >= 0,
                                    'bi-arrow-down': cambioSemanal < 0
                                }"></i>
                                {{ Math.abs(cambioSemanal) }}% VS la semana pasada
                            </small>
                        </div>
                        <div class="icon-wrapper bg-primary-light">
                            <button type="button" class="btn btn-outline-primary" @click="showModal = true">
                                <i class="bi bi-people-fill"></i>
                                Asignar nuevo
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- Card 2: Nuevos Usuarios -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between alLA ign-items-start">
                        <div>
                            <h6 class="card-subtitle mb-2 text-muted">Próximas a vencer</h6>
                            <h3 class="mb-0">{{ vencenHoy }}</h3>
                            <small :class="{'text-warning': vencenHoy > 0, 'text-muted': vencenHoy === 0}">
                                <i :class="{
                                    'bi': true,
                                    'bi-arrow-down': vencenHoy > 0,
                                    'bi-check-circle': vencenHoy === 0
                                }"></i>
                                {{ vencenHoy > 0 ? 'Vencen hoy' : 'No hay tareas por vencer' }}
                            </small>
                        </div>
                        <div class="icon-wrapper bg-success-light">
                            <i class="bi bi-hourglass-split text-warning fs-2"></i>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- Card 3: Actividad Reciente -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-subtitle mb-2 text-muted">Vencidas</h6>
                            <h3 class="mb-0">{{ vencidas }}</h3>
                            <small class="text-danger">
                            <i class="bi bi-clock-fill"></i> tareas vencidas sin terminar
                            </small>
                        </div>
                        <div class="icon-wrapper bg-warning-light">
                            <i class="bi bi-activity text-danger fs-2"></i>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-center mb-5">
            <div class="col-12 col-lg-6">
                <div class="input-group position-relative">
                    <i class="bi bi-search text-dark-subtle search-icon"></i>
                    <input
                    type="search"
                    class="form-control text-center border-dark-subtle rounded-pill"
                    placeholder="Search project"
                    aria-label="Search project"
                    v-model="searchQuery">
                </div>
            </div>
        </div>


        <div class="">
            <div class="table-responsive">
                <table class="table table-striped border rounded-4 table-sm">
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
                        <tr v-for="task in paginatedTasks" :key="task.id_activities" :class="{'table-danger': isVencida(task)}">
                            <td><i class="bi bi-person-circle me-1"></i>{{ task.nombre_asignado }} {{ task.paterno_asignado }} {{ task.materno_asignado }}</td> 
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
                                <span style="height: 20px; width: 60px;" class="badge"
                                :class="{
                                    'bg-danger': task.prioridad === 'alta',
                                    'bg-warning': task.prioridad === 'media',
                                    'bg-success': task.prioridad === 'baja'
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
            </div>

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

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id
// console.log('Usuario creador:', usuario_creador)

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
            pageSize: 10
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
        totalPages() {
            return Math.ceil(this.tasks.length / this.pageSize)
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
                const res = await fetch('http://localhost:4000/api/tasks')
                if (!res.ok) throw new Error('Error al obtener usuarios')
                this.tasks = await res.json()
                this.proximasVencer()
            } catch (error) {
                console.error('Error al cargar tareas:', error.message)
            }
        },
        Asignar() {
            // Aquí puedes manejar la lógica para asignar una nueva tarea
            console.log('Asignar nueva tarea');
            this.showModal = false; // Cerrar el modal después de asignar
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
            console.log('Tareas que vencen hoy:', this.vencenHoy);
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
    },

    created() {
        this.loadTask()
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

.input-group {
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  z-index: 10;
  pointer-events: none; /* Prevent icon from blocking input clicks */
}

.form-control.rounded-pill {
  padding-left: 2.5rem; /* Space for icon */
  border: 1px solid #6c757d; /* Match border-dark-subtle */
}

</style>
