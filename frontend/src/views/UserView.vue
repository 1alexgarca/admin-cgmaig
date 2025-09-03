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
                                <p class="stats-label mb-1">Total Usuarios</p>
                                <h3 class="stats-value mb-0">{{ totalUsers }}</h3>
                                <small class="text-success">
                                    <i class="bi bi-circle-fill me-1"></i>
                                    Usuarios Activos
                                </small>
                            </div>
                        </div>
                        <div class="stats-progress mt-3">
                            <div class="progress-bar bg-primary" :style="`width: ${Math.min((totalUsers / 100) * 100, 100)}%`"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nuevos Esta Semana -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-success">
                                <i class="bi bi-person-plus"></i>
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <p class="stats-label mb-1">Esta Semana</p>
                                <h3 class="stats-value mb-0">{{ nuevosSemana }}</h3>
                                <small class="text-success">
                                    <i class="bi bi-arrow-up me-1"></i>
                                    {{ porcentajeSemana }}% progreso
                                </small>
                            </div>
                        </div>
                        <div class="stats-progress mt-3">
                            <div class="progress-bar bg-success" :style="`width: ${Math.min(porcentajeSemana, 100)}%`"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nuevos Hoy -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-warning">
                                <i class="bi bi-calendar-day"></i>
                            </div>
                            <div class="ms-3 flex-grow-1">
                                <p class="stats-label mb-1">Hoy</p>
                                <h3 class="stats-value mb-0">{{ nuevosHoy }}</h3>
                                <span class="badge bg-warning-subtle text-warning">
                                    Nuevos registros
                                </span>
                            </div>
                        </div>
                        <div class="stats-progress mt-3">
                            <div class="progress-bar bg-warning" :style="`width: ${Math.min((nuevosHoy / 5) * 100, 100)}%`"></div>
                        </div>
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
                            placeholder="Buscar usuarios por nombre..."
                            v-model="searchQuery">
                    </div>
                </div>
                <div class="col-md-6 text-md-end mt-3 mt-md-0">
                    <div class="control-buttons">
                        <button class="btn btn-outline-secondary" @click="showModal = true">
                            <i class="bi bi-person-fill-add"></i>
                            Agregar Usuario
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Users Table Section -->
        <div class="table-section">
            <div class="table-container">
                <div class="table-header p-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="table-title mb-0">
                            <i class="bi bi-people me-2"></i>
                            Lista de Usuarios
                        </h5>
                        <span class="badge bg-primary-subtle text-primary fs-6">
                            {{ filteredUsers.length }} usuarios encontrados
                        </span>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-header-bg">
                            <tr>
                                <th scope="col" class="table-th">
                                    <div class="th-content">
                                        <i class="bi bi-person me-2"></i>
                                        Nombre Completo
                                    </div>
                                </th>
                                <th scope="col" class="table-th">
                                    <div class="th-content">
                                        <i class="bi bi-envelope me-2"></i>
                                        Email
                                    </div>
                                </th>
                                <th scope="col" class="table-th">
                                    <div class="th-content">
                                        <i class="bi bi-telephone me-2"></i>
                                        Teléfono
                                    </div>
                                </th>
                                <th scope="col" class="table-th">
                                    <div class="th-content">
                                        <i class="bi bi-calendar-event me-2"></i>
                                        Fecha Registro
                                    </div>
                                </th>
                                <th scope="col" class="table-th">
                                    <div class="th-content">
                                        <i class="bi bi-gear me-2"></i>
                                        Acciones
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in filteredUsers" :key="user.id_user" class="table-row">
                                <td class="table-cell">
                                    <div class="user-info">
                                        <div class="user-avatar bg-primary">
                                            {{ (user.name?.charAt(0) || '') + (user.lastNameP?.charAt(0) || '') }}
                                        </div>
                                        <div class="user-details">
                                            <div class="user-name">{{ user.name }} {{ user.lastNameP }} {{ user.lastNameM }}</div>
                                            <small class="user-role text-muted">Trabajador</small>
                                        </div>
                                    </div>
                                </td>
                                <td class="table-cell">
                                    <div class="email-container">
                                        <i class="bi bi-envelope text-muted me-2"></i>
                                        <span class="email-text">{{ user.email }}</span>
                                    </div>
                                </td>
                                <td class="table-cell">
                                    <div class="phone-container">
                                        <i class="bi bi-phone text-muted me-2"></i>
                                        <span class="phone-text">{{ user.phoneNumber || 'No disponible' }}</span>
                                    </div>
                                </td>
                                <td class="table-cell">
                                    <div class="date-container">
                                        <i class="bi bi-calendar3 text-muted me-2"></i>
                                        <span class="date-text">{{ user.fecha_creacion || 'No disponible' }}</span>
                                    </div>
                                </td>
                                <td class="table-cell">
                                    <div class="action-buttons">
                                        <button class="btn btn-action btn-edit" title="Editar usuario">
                                            <i class="bi bi-pencil-square"></i>
                                        </button>
                                        <button class="btn btn-action btn-delete" @click="deleteUser(user)" title="Eliminar usuario">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Empty State -->
                    <div v-if="filteredUsers.length === 0" class="empty-state-table">
                        <div class="empty-content">
                            <div class="empty-icon">
                                <i class="bi bi-person-x display-1"></i>
                            </div>
                            <h5 class="empty-title">{{ searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados' }}</h5>
                            <p class="empty-description">
                                {{ searchQuery ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer usuario al sistema' }}
                            </p>
                            <button class="btn btn-primary" @click="showModal = true" v-if="!searchQuery">
                                <i class="bi bi-person-plus me-2"></i>
                                Agregar Usuario
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="table-footer p-4" v-if="filteredUsers.length > 0">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="pagination-info">
                            <span class="text-muted">
                                Mostrando {{ filteredUsers.length }} de {{ totalUsers }} usuarios
                            </span>
                        </div>
                        <nav aria-label="Paginación de usuarios">
                            <ul class="pagination pagination-modern mb-0">
                                <li class="page-item">
                                    <a class="page-link" href="#" aria-label="Anterior">
                                        <i class="bi bi-chevron-left"></i>
                                    </a>
                                </li>
                                <li class="page-item active">
                                    <a class="page-link" href="#">1</a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link" href="#">2</a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link" href="#">3</a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link" href="#" aria-label="Siguiente">
                                        <i class="bi bi-chevron-right"></i>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
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
        filteredUsers() {
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
        }
    },
    created() {
        this.loadUsers();
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