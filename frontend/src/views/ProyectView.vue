<template>
    <div class="content-view">
        <div class="row g-4 mb-4">
            <!-- Card 1: Total Proyectos -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Total Proyectos</h6>
                                <h3 class="mb-0">{{ totalProject }}</h3>
                            
                            </div>
                            <div class="icon-wrapper bg-primary-light">
                                <i class="bi bi-folder2-open text-primary fs-2"></i>
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
                                <h6 class="card-subtitle mb-2 text-muted">Nuevos proyectos</h6>
                                <h3 class="mb-0">24</h3>
                            </div>
                            <div class="icon-wrapper bg-success-light">
                                <i class="bi bi-cloud-check-fill text-success fs-2"></i>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>

            <!-- Card 3: Agregar Nuevo Proyecto -->
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="d-grid gap-2">
                                <h6 class="card-subtitle mb-2 text-muted">Agregar Nuevo Proyecto</h6>
                                <button class="btn btn-outline-primary" @click="showModal= true">Nuevo Proyecto</button>
                            </div>
                            <div class="icon-wrapper bg-warning-light">
                                <i class="bi bi-folder-plus text-primary fs-2"></i>
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

        <div class="d-flex flex-wrap gap-3">
            <div v-for="project in filteredProjects" :key="project.id_project" class="card h-100 status-card" style="width: 18rem;" >
                <div class="card-body d-grid gap-2">
                    <h5 class="card-title text-truncate"> <i class="bi bi-pc-display-horizontal"></i> {{ project.name_project}}</h5>
                    <p class="card-text text-truncate"> {{ project.description }}</p>
                    <button type="button" class="btn btn-outline-info" @click="editProject(project)">
                        Editar
                    </button>
                </div>
            </div>

            <div v-if="projects.length === 0" class="d-flex justify-content-center" style="width: 100%;">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Aun no hay proyectos</h5>
                        <p class="card-text">En este apartado se visualizaran los proyectos que guarde.</p>
                    </div>
                </div>
            </div>

        </div>
    </div>

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
            this.selectedProject = project,
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
/* Style the input group and icon */
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

/* Responsive adjustments */
@media (max-width: 575.98px) {
  .form-control.rounded-pill {
    height: 40px;
    padding-left: 2.75rem; /* Slightly more space on mobile */
  }
  .search-icon {
    font-size: 0.9rem;
    left: 0.65rem;
  }
}

/* Existing styles */
.container-fluid {
  background-color: #f8f9fa;
}
.btn-update {
  border: 2px solid #60a5fa;
  color: #212529;
  background-color: transparent;
  transition: all 0.2s ease;
}
.btn-update:hover {
  background-color: rgba(96, 165, 250, 0.1);
  border-color: #93c5fd;
  color: #212529;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn-delete {
  border: 2px solid #f87171;
  color: #212529;
  background-color: transparent;
  transition: all 0.2s ease;
}
.btn-delete:hover {
  background-color: rgba(248, 113, 113, 0.1);
  border-color: #ef4444;
  color: #212529;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
/* ... Other existing styles (status-card, etc.) ... */

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
}

</style>