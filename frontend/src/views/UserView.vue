<template>
    <div class="content-view">
        <!-- Tarjetas responsive -->
        <div class="row g-4 mb-4">
            <!-- Card 1: Total Usuarios -->
            <div class="col-12 col-md-6 col-lg-4">

                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Total de Usuarios</h6>
                                <h3 class="mb-0">{{ totalUsers }}</h3>
                            </div>
                            <div class="icon-wrapper bg-primary-light">
                                <i class="bi bi-people-fill text-primary fs-2"></i>
                                <div class="mt-3 text-end">
                                    <i class="text-success">Usuario Activos</i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 2: Nuevos Usuarios -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Nuevos Usuarios esta Semana</h6>
                                <h3 class="mb-0">{{ nuevosSemana }}</h3>
                                <small class="text-success">
                                <i class="bi bi-arrow-up"></i> {{ porcentajeSemana }}% vs semana anterior
                                </small> 
                            </div>
                            <div class="icon-wrapper bg-success-light">
                                <i class="bi bi-person-plus text-success fs-2"></i>
                                <div class="mt-3 text-end">
                                    <span class="badge bg-success">+ {{ nuevosHoy }} hoy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 3: Actividad Reciente -->
            <!-- <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="card-subtitle mb-2 text-muted">Actividad Hoy</h6>
                        <h3 class="mb-0">83%</h3>
                        <small class="text-warning">
                        <i class="bi bi-arrow-down"></i> 5% menos que ayer
                        </small>
                    </div>
                    <div class="icon-wrapper bg-warning-light">
                        <i class="bi bi-activity text-warning fs-2"></i>
                    </div>
                    </div>
                    <div class="mt-3">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-clock-history me-2"></i>
                        <small>Promedio: 1h 24m por usuario</small>
                    </div>
                    </div>
                </div>
                </div>
            </div> -->
        </div>

        
        <div class="d-flex justify-content-end align-items-center mb-4">
            <div>
                <div style="margin-right: 2rem;">
                    <div class="input-group">
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
            <button class="btn btn-primary" @click="showModal = true">
                <i class="bi bi-plus-circle me-2"></i> Añadir Usuario
            </button>

        </div>

        <div class="">
            <div class="table-responsive">
                <table class="table table-striped border rounded-4 table-sm">
                    <thead class="small">
                        <tr class="fw-medium">
                            <th scope="col"><i class="bi bi-person-square"></i> Nombre</th>
                            <th scope="col"><i class="bi bi-envelope"></i> Email</th>
                            <th scope="col"><i class="bi bi-telephone-fill"></i> Núm. telefónico</th>
                            <th scope="col"><i class="bi bi-calendar-day"></i> Fecha de Registro</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in filterdUsers" :key="user.id_user">
                           <td>{{ user.name }} {{ user.lastNameP }} {{ user.lastNameM }}</td> 
                           <td>{{ user.email }}</td> 
                           <td>{{ user.phoneNumber }}</td> 
                           <td>{{ user.fecha_creacion }}</td> 
                           <td>
                                <button class="btn btn-sm btn-outline-info me-1"><i class="bi bi-pencil-square"></i></button>
                                <button class="btn btn-sm btn-outline-danger" @click="deleteUser(user)"><i class="bi bi-trash"></i></button>
                           </td> 
                        </tr>
                        <tr v-if="users.length === 0">
                            <td colspan="5" class="text-center">No hay usuarios registrados</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="d-flex justify-content-center mt-4">
                <nav aria-label="Page navigation example">
                    <ul class="pagination">
                        <li class="page-item">
                            <a href="#" class="page-link" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                        <li class="page-item"><a href="#" class="page-link">1</a></li>
                        <li class="page-item"><a href="#" class="page-link">2</a></li> 
                        <li class="page-item"><a href="#" class="page-link">3</a></li>
                        <li class="page-item">
                            <a href="#" class="page-link" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>

    </div>

    <UserModal 
    :show="showModal" 
    @close="showModal = false" 
    @submit="UserAdd"/>

    <UserDModal
    :show="showDelete"
    :initialData="delUser"
    @close="showDelete = false"
    @saved="UserDel"
    />

</template>

<script>
import axios from 'axios';
import UserModal from '../components/UserModal.vue';
import UserDModal from '@/components/UserDModal.vue';

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id

export default {    
    name: 'UserView', 
    components: {
        UserModal,
        UserDModal
    },
    data() {
        return {
            showModal: false,
            users: [],
            nuevosHoy: 0,
            nuevosSemana: 0,
            porcentajeSemana: 0,
            showDelete: false,
            ViewDelete: false,
            delUser: {},
            searchQuery: ''
        };
    },
    computed: {
        totalUsers() {
            return this.users.filter(user => user.rol === 'trabajador').length
        },
        filterdUsers() {
            return this.users.filter(user => 
                user.rol === 'trabajador' &&
                (this.searchQuery === '' || 
                    `${user.name} ${user.lastNameP} ${user.lastNameM}`.toLowerCase().includes(this.searchQuery.toLowerCase())
                )                   
            )  
        },
    },
    methods: {
        deleteDetails() {
            this.delUser = user
            this.ViewDelete = true
        },
        async loadUsers() {
            try {
                const response = await axios.get(`http://localhost:4000/api/users/${usuario_creador}` );
                this.users = response.data;
            } catch (error) {
                console.error('Error al cargar usuarios:', error.message);
            }
            this.calcularNuevos()
            
        },
        Asignar() {
            console.log('Asignar usuario');
            this.showModal = false;
        },
        parseFecha(fechaStr) {
            if (!fechaStr || typeof fechaStr !== 'string') return null;

            const partes = fechaStr.trim().split('/');
            if (partes.length !== 3) return null;

            const [dia, mes, anio] = partes;
            const isoString = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            const fecha = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));

            return isNaN(fecha.getTime()) ? null : fecha;
        },
        calcularNuevos() {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const inicioSemana = new Date();
            inicioSemana.setDate(hoy.getDate() - hoy.getDay());
            inicioSemana.setHours(0, 0, 0, 0);

            this.nuevosHoy = this.users.filter(u => {
                if (!u.fecha_creacion || u.rol !== 'trabajador') return false;

                const fechaUsuario = this.parseFecha(u.fecha_creacion);

                if (!fechaUsuario) return false;

                return (
                    fechaUsuario.getDate() === hoy.getDate() &&
                    fechaUsuario.getMonth() === hoy.getMonth() &&
                    fechaUsuario.getFullYear() === hoy.getFullYear()
                );
            }).length;

            this.nuevosSemana = this.users.filter(u => {
                if (!u.fecha_creacion || u.rol !== 'trabajador') return false;

                const fechaUsuario = this.parseFecha(u.fecha_creacion);
                if (!fechaUsuario) return false;

                return fechaUsuario >= inicioSemana && fechaUsuario <= hoy;
            }).length;

            const meta = 30;
            this.porcentajeSemana = Math.round((this.nuevosSemana / meta) * 100);
        },
        UserAdd() {
            this.loadUsers();
        },
        deleteUser(user){ 
            this.delUser = {
                id: user.id_user,
                nombre: `${user.name} ${user.lastNameP} ${user.lastNameM}`,
                email: user.email,
                telefono: user.phoneNumber,
            }
            console.log('Datos enviados para eliminar', this.delUser)
            this.showDelete = true
        },
        UserDel(deletedUser) {
            console.log('Usuario eliminada:', deletedUser)
            const index = this.users.findIndex(
                user => user.id_user === deletedUser
            )
            if (index !== -1) {
                this.users.splice(index, 1)
            }
            this.showDelete = false
            // history.showDelete = false
        }



    },
    created() {
        this.loadUsers();
    }
}

</script>

<style>
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