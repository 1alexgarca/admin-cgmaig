<template>
    <div class="content-view">
        <!-- Statistics Cards -->
        <div class="row g-4 mb-5 mt-1">
            <!-- Total Proyectos -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-primary">
                                <i class="bi bi-folder2-open"></i>
                            </div>
                            <div class="ms-3">
                                <p class="stats-label mb-1">Total Proyectos</p>
                                <h3 class="stats-value mb-0">{{ totalProject }}</h3>
                            </div>
                        </div>
                        <div class="stats-progress mt-3">
                            <div class="progress-bar bg-primary" style="width: 75%;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nuevos Proyectos -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-success">
                                <i class="bi bi-graph-up-arrow"></i>
                            </div>
                            <div class="ms-3">
                                <p class="stats-label mb-1">Nuevos este mes</p>
                                <h3 class="stats-value mb-0">24</h3>
                            </div>
                        </div>
                        <div class="stats-progress mt-3">
                            <div class="progress-bar bg-success" style="width: 60%;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Activos -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-warning">
                                <i class="bi bi-lightning-fill"></i>
                            </div>
                            <div class="ms-3">
                                <p class="stats-label mb-1">Activos</p>
                                <h3 class="stats-value mb-0">{{ Math.floor(totalProject * 0.8) }}</h3>
                            </div>
                        </div>
                        <div class="stats-progress mt-3">
                            <div class="progress-bar bg-warning" style="width: 85%;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Completados -->
            <!-- <div class="col-12 col-md-6 col-xl-3">
                <div class="stats-card card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center">
                            <div class="stats-icon bg-info">
                                <i class="bi bi-check-circle-fill"></i>
                            </div>
                            <div class="ms-3">
                                <p class="stats-label mb-1">Completados</p>
                                <h3 class="stats-value mb-0">{{ Math.floor(totalProject * 0.3) }}</h3>
                            </div>
                        </div>
                        <div class="stats-progress mt-3">
                            <div class="progress-bar bg-info" style="width: 45%;"></div>
                        </div>
                    </div>
                </div>
            </div> -->
        </div>

        <!-- Search and Filter Section -->
        <div class="search-section mb-4">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <div class="search-wrapper">
                        <i class="bi bi-search search-icon"></i>
                        <input
                            type="search"
                            class="form-control search-input rounded-pill"
                            placeholder="Buscar proyectos..."
                            v-model="searchQuery">
                    </div>
                </div>
            </div>
        </div>

        <!-- Projects Grid -->
        <div class="projects-grid">
            <div class="row g-4" v-if="filteredProjects.length > 0">
                <div v-for="project in filteredProjects" :key="project.id_project" class="col-12 col-md-6 col-lg-4">
                    <div class="project-card card border-0 shadow-sm">
                        <div class="card-body p-4">
                            <!-- Project Header -->
                            <div class="project-header d-flex justify-content-end mb-3">
                                <div class="project-status">
                                    <span class="badge bg-success-subtle text-success">Activo</span>
                                </div>
                            </div>

                            <!-- Project Info -->
                            <div class="project-info mb-4">
                                <h5 class="project-title mb-2">{{ project.name_project }}</h5>
                                <p class="project-description text-muted">{{ project.description || 'Sin descripción disponible' }}</p>
                            </div>

                            <!-- Estado de proyecto -->
                            <!-- <div class="project-stats mb-4">
                                <div class="row text-center">
                                    <div class="col-4">
                                        <div class="stat-item">
                                            <div class="stat-value">{{ Math.floor(Math.random() * 10) + 1 }}</div>
                                            <div class="stat-label">Tareas</div>
                                        </div>
                                    </div>
                                    <div class="col-4">
                                        <div class="stat-item">
                                            <div class="stat-value">{{ Math.floor(Math.random() * 5) + 1 }}</div>
                                            <div class="stat-label">Miembros</div>
                                        </div>
                                    </div>
                                    <div class="col-4">
                                        <div class="stat-item">
                                            <div class="stat-value">{{ Math.floor(Math.random() * 100) }}%</div>
                                            <div class="stat-label">Progreso</div>
                                        </div>
                                    </div>
                                </div>
                            </div> -->

                            <!-- Project Actions -->
                            <div class="project-actions d-flex gap-2">
                                <button class="btn gobPrimary text-white flex-fill" @click="editProject(project)">
                                    <i class="bi bi-pencil me-1"></i>
                                    Editar
                                </button>
                                <!-- <button class="btn btn-outline-secondary" @click="viewDetails(project)">
                                    <i class="bi bi-eye"></i>
                                </button> -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state text-center py-5">
                <div class="empty-icon mb-4">
                    <i class="bi bi-folder-x display-1 text-muted"></i>
                </div>
                <h4 class="empty-title mb-3">{{ searchQuery ? 'No se encontraron proyectos' : 'Aún no hay proyectos' }}</h4>
                <p class="empty-description text-muted mb-4">
                    {{ searchQuery ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primer proyecto' }}
                </p>
                <button class="btn btn-primary btn-lg" @click="showModal = true" v-if="!searchQuery">
                    <i class="bi bi-plus-circle me-2"></i>
                    Crear Primer Proyecto
                </button>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <ProyectModal
        :show="showModal"
        @close="showModal = false"
        @submit="ProjectAdd"
    />

    <ActualizarPModal
        :show="showUpdate"
        :initialData="selectedProject"
        @close="showUpdate = false"
        @saved="ProjectUp"
    />
</template>

<script>
import ActualizarPModal from '../components/ActualizarPModal.vue'
import ProyectModal from '../components/ProyectModal.vue'

export default {
    name: 'ProyecView',
    components: {
        ProyectModal,
        ActualizarPModal
    },
    data() {
        return {
            showModal: false,
            showUpdate: false,
            showDetails: false,
            selectedProject: {},
            projects: [],
            searchQuery: ''
        }
    },
    computed: {
        totalProject() {
            return this.projects.filter(project => project).length
        },
        filteredProjects(){
            if (!this.searchQuery) return this.projects

            return this.projects.filter(project => 
                project.name_project.toLowerCase().includes(this.searchQuery.toLowerCase())
            )
        }
    },
    methods: {
        viewDetails(project) {
            this.selectedProject = project
            this.showDetails = true
        },
        async loadProject() {
            try {
                const res = await fetch('http://localhost:4000/api/project')
                if (!res.ok) throw new Error('Error al obtener proyectos')
                this.projects = await res.json()
            } catch (error) {
                console.error('Error al cargar usuarios:', error.message)
            }
        }, 
        Asignar() {
            console.log('Asignar proyecto')
            this.showModal = false
        },
        ProjectAdd(newProject) {
            if (newProject && newProject.name) {
                this.projects.push(newUser)
            } else {
                this.loadProject()
            }
        },
        editProject(project) {
            this.selectedProject = {
                id: project.id_project,
                project: project.name_project,
                description: project.description
            } 
            console.log('Datos enviados al modal:', this.selectedProject)
            this.showUpdate = true
        },
        ProjectUp(updatedProject) {
            console.log('Proyecto actualizado recibido:', updatedProject)

            const index = this.projects.findIndex(
                p => p.id_project === updatedProject.id_proyecto
            )

            if (index !== -1) {
                this.projects[index] = {
                    ...this.projects[index],
                    name_project: updatedProject.name_proyect,
                    description: updatedProject.descripcion
                }
            }

            this.showUpdate = false
        }
    },
    created(){
        this.loadProject()
    }
}
</script>

<style scoped>
/* Variables CSS */
:root {
    --primary-color: #3b82f6;
    --primary-light: #dbeafe;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --info-color: #06b6d4;
    --secondary-color: #6b7280;
    --light-bg: #f8fafc;
    --border-radius: 12px;
    --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --transition: all 0.3s ease;
}

/* Content View */
.content-view {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
    padding: 2rem;
}

.gobPrimary {
    background-color: rgb(105, 28, 32);
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
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
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

/* Search Section */
.search-section {
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
    border: 2px solid #e5e7eb;
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: var(--transition);
}

.search-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Project Cards */
.projects-grid {
    margin-top: 2rem;
}

.project-card {
    border-radius: var(--border-radius);
    transition: var(--transition);
    background: white;
    height: 100%;
}

.project-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.project-header {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 1rem;
}

.project-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-color), #1d4ed8);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
}

.project-title {
    font-weight: 700;
    color: #1e293b;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}

.project-description {
    font-size: 0.9rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.project-stats {
    background: var(--light-bg);
    border-radius: 8px;
    padding: 1rem;
}

.stat-item {
    text-align: center;
}

.stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
}

.stat-label {
    font-size: 0.75rem;
    color: var(--secondary-color);
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
}

.project-actions .btn {
    border-radius: 8px;
    font-weight: 600;
    transition: var(--transition);
}

.project-actions .btn:hover {
    transform: translateY(-1px);
}

/* Empty State */
.empty-state {
    background: white;
    border-radius: var(--border-radius);
    padding: 4rem 2rem;
    box-shadow: var(--box-shadow);
}

.empty-icon i {
    font-size: 4rem;
    color: #d1d5db;
}

.empty-title {
    color: #374151;
    font-weight: 700;
}

.empty-description {
    font-size: 1.1rem;
    max-width: 400px;
    margin: 0 auto;
}

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
    
    .project-card:hover {
        transform: none;
    }
}

@media (max-width: 576px) {
    .project-actions {
        flex-direction: column;
    }
    
    .project-actions .btn {
        margin-bottom: 0.5rem;
    }
    
    .filter-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
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
.project-card,
.search-section {
    animation: fadeInUp 0.6s ease forwards;
}

.stats-card:nth-child(2) { animation-delay: 0.1s; }
.stats-card:nth-child(3) { animation-delay: 0.2s; }
.stats-card:nth-child(4) { animation-delay: 0.3s; }

/* Badge Styles */
.badge {
    font-weight: 600;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
}

.bg-success-subtle {
    background-color: #dcfce7 !important;
}

.text-success {
    color: var(--success-color) !important;
}
</style>