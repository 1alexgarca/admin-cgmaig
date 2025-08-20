<template>
  <div class="content-view">
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error:</strong> {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Tarjetas de Estadísticas Superiores -->
    <div class="row g-3 mb-4">
      <!-- Tarjeta Total Actividades -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card mb-3 border-0 bg-info rounded-4 shadow bg-opacity-10">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h5 class="card-title fw-bold">Total Actividades</h5>
              <div class="rounded-circle bg-info d-flex justify-content-center align-items-center"
                style="width: 50px; height: 50px;">
                <i class="bi bi-journal-text text-white fs-3"></i>
              </div>
            </div>
            <h3 class="text-info fw-bold">{{ estadisticas.totalActividades }}</h3>
          </div>
        </div>
      </div>

      <!-- Tarjeta En Proceso -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card mb-3 border-0 shadow bg-warning rounded-4 bg-opacity-10">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h5 class="card-title fw-bold">En Proceso</h5>
              <div class="rounded-circle bg-warning d-flex justify-content-center align-items-center"
                style="height: 50px; width: 50px;">
                <i class="bi bi-hourglass-split text-white fs-3"></i>
              </div>
            </div>
            <h3 class="text-warning fw-bold">{{ estadisticas.tareasEnProceso }}</h3>
          </div>
        </div>
      </div>

      <!-- Tarjeta Completadas -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card mb-3 border-0 shadow bg-success rounded-4 bg-opacity-10">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h5 class="card-title fw-bold">Completadas</h5>
              <div class="rounded-circle d-flex justify-content-center align-items-center" 
                style="background: #198754; width: 50px; height: 50px;">
                <i class="bi bi-journal-check fs-3 text-white"></i>
              </div>
            </div>
            <h3 class="fw-bold text-success">{{ estadisticas.tareasCompletadas || 0 }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <!-- SECCIÓN HORAS Y ASISTENCIAS -->
      <div class="col-12 col-lg-4" style="height: 30rem;">
        <div class="card rounded-4 shadow-sm h-100">
          <div class="card-body">
            <!-- Header con controles -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">Horas y Asistencia</h5>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" @click="toggleSearch('horas')">
                  <i class="bi bi-search"></i>
                </button>
                <div class="dropdown">
                  <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                    type="button" @click="toggleDropdown('horas')">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu" :class="{ show: dropdownVisible.horas }">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="toggleTeamView('horas')">
                        {{ showTeamHoras ? 'Ver Individual' : 'Ver Equipo' }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Búsqueda de Usuario -->
            <div v-show="searchHoras" class="mb-3">
              <div class="position-relative">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Buscar usuario..." 
                  v-model="searchTerm"
                  @input="filterUsers"
                >
                <div v-if="filteredUsers.length && searchTerm" 
                  class="list-group position-absolute w-100 shadow-sm" 
                  style="z-index: 1050; max-height: 200px; overflow-y: auto;">
                  <button 
                    v-for="user in filteredUsers" 
                    :key="user.id_user" 
                    class="list-group-item list-group-item-action"
                    @click="selectUser(user)">
                    {{ user.nombre }} {{ user.paterno }} {{ user.materno }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Usuario Seleccionado -->
            <div class="mb-3">
              <small class="text-muted">Usuario actual:</small>
              <div class="fw-bold">
                {{ getCurrentUserName() }}
              </div>
            </div>

            <!-- Resumen de Horas -->
            <div class="mb-3">
              <h6>
                <span class="badge bg-primary">{{ getTotalHorasSemanales() }}</span>
                Horas esta semana
              </h6>
              <div v-if="shouldShowWarning()" class="alert alert-warning p-2 mt-2">
                <small>
                  <i class="bi bi-exclamation-triangle"></i>
                  No cumplirá con las 40 horas semanales
                </small>
              </div>
            </div>

            <!-- Carrusel de Gráficos de Horas -->
            <div id="carouselHoras" class="carousel slide" data-bs-ride="false">
              <div class="carousel-indicators">
                <button type="button" data-bs-target="#carouselHoras" data-bs-slide-to="0" class="active"></button>
                <button type="button" data-bs-target="#carouselHoras" data-bs-slide-to="1"></button>
              </div>
              <div class="carousel-inner">
                <div class="carousel-item active">
                  <h6 class="fw-bold mb-2">Horas Diarias</h6>
                  <div style="position: relative; height: 200px; width: 100%;">
                    <canvas id="horasDiariasChart" style="height: 200px; width: 100%;"></canvas>
                  </div>
                  <div class="d-flex justify-content-around mb-3">
                    <div class="d-flex align-items-center">
                      <div style="height: 15px; width: 15px;" class="bg-primary rounded-2 "></div>
                      <small class="ms-2 fst-italic">Horas cumplidas</small>
                    </div>

                    <div class="d-flex align-items-center">
                      <div style="height: 15px; width: 15px;" class="bg-success rounded-2"></div>
                      <small class="ms-2 fst-italic">Horas extras</small>
                    </div>
                  </div>
                  <div class="d-flex justify-content-center">
                    <div class="d-flex align-items-center">
                      <div style="height: 15px; width: 15px;" class="bg-danger rounded-2" ></div>
                      <small class="ms-2 fst-italic">No cumplio</small>
                    </div>
                  </div>
                </div>
                <div class="carousel-item">
                  <h6 class="fw-bold mb-2">Horas Semanales</h6>
                  <div style="height: 200px; width: 100%;">
                    <canvas id="horasSemanalesChart" style="height: 200; height: 100%;"></canvas>
                  </div>                  
                </div>
              </div>
              <button class="carousel-control-prev" type="button" data-bs-target="#carouselHoras" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#carouselHoras" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN PRODUCTIVIDAD -->
      <div class="col-12 col-lg-4">
        <div class="card rounded-4 shadow-sm h-100">
          <div class="card-body">
            <!-- Header -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">Productividad</h5>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" @click="toggleSearch('productividad')">
                  <i class="bi bi-search"></i>
                </button>
                <div class="dropdown" >
                  <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                    type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="toggleTeamView('productividad')">
                        {{ showTeamProductividad ? 'Ver Individual' : 'Ver Equipo' }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Búsqueda -->
            <div v-show="searchProductividad" class="mb-3">
              <div class="position-relative">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Buscar usuario..." 
                  v-model="searchTerm"
                  @input="filterUsers"
                >
                <div v-if="filteredUsers.length && searchTerm" 
                  class="list-group position-absolute w-100 shadow-sm" 
                  style="z-index: 1050; max-height: 200px; overflow-y: auto;">
                  <button 
                    v-for="user in filteredUsers" 
                    :key="user.id_user" 
                    class="list-group-item list-group-item-action"
                    @click="selectUser(user)">
                    {{ user.nombre }} {{ user.paterno }} {{ user.materno }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Usuario Seleccionado -->
            <div class="mb-3">
              <small class="text-muted">Usuario actual:</small>
              <div class="fw-bold">{{ getCurrentUserName() }}</div>
            </div>

            <!-- Estadísticas Productividad -->
            <div class="mb-3">
              <div class="row text-center">
                <div class="col-4">
                  <div class="fw-bold text-success">{{ productividad.tareas_completadas || 0 }}</div>
                  <small class="text-muted">Completadas</small>
                </div>
                <div class="col-4">
                  <div class="fw-bold text-warning">{{ productividad.tareas_pendientes || 0 }}</div>
                  <small class="text-muted">Pendientes</small>
                </div>
                <div class="col-4">
                  <div class="fw-bold text-info">{{ productividad.promedio_avance || 0 }}%</div>
                  <small class="text-muted">Avance</small>
                </div>
              </div>
            </div>

            <!-- Carrusel Productividad -->
            <div id="carouselProductividad" class="carousel slide" data-bs-ride="false">
              <div class="carousel-indicators">
                <button type="button" data-bs-target="#carouselProductividad" data-bs-slide-to="0" class="active"></button>
                <button type="button" data-bs-target="#carouselProductividad" data-bs-slide-to="1"></button>
                <button type="button" data-bs-target="#carouselProductividad" data-bs-slide-to="2"></button>
              </div>
              <div class="carousel-inner">
                <div class="carousel-item active">
                  <h6 class="fw-bold mb-2">Tareas</h6>
                  <div style="height: 200px; width: 100%;">
                    <canvas id="productividadTareasChart" style="height: 200px; width: 100%;"></canvas>
                  </div>
                </div>
                <div class="carousel-item">
                  <h6 class="fw-bold mb-2">Avance Semanal</h6>
                  <div style="height: 200px; width: 100%;">
                    <canvas id="productividadAvanceChart" style="height: 200px; width: 100%;"></canvas>
                  </div>
                </div>
                <div class="carousel-item">
                  <h6 class="fw-bold mb-2">Meta de Horas</h6>
                  <div style="height: 200px; width: 100%;">
                    <canvas id="productividadMetaChart" style="height: 200px; width: 100%;"></canvas>
                  </div>
                </div>
              </div>
              <button class="carousel-control-prev" type="button" data-bs-target="#carouselProductividad" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#carouselProductividad" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN DESEMPEÑO -->
      <div class="col-12 col-lg-4">
        <div class="card rounded-4 shadow-sm h-100">
          <div class="card-body">
            <!-- Header -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">Desempeño</h5>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" @click="toggleSearch('desempeno')">
                  <i class="bi bi-search"></i>
                </button>
                <div class="dropdown">
                  <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                    type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="toggleTeamView('desempeno')">
                        {{ showTeamDesempeno ? 'Ver Individual' : 'Ver Ranking' }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Búsqueda -->
            <div v-show="searchDesempeno" class="mb-3">
              <div class="position-relative">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Buscar usuario..." 
                  v-model="searchTerm"
                  @input="filterUsers"
                >
                <div v-if="filteredUsers.length && searchTerm" 
                  class="list-group position-absolute w-100 shadow-sm" 
                  style="z-index: 1050; max-height: 200px; overflow-y: auto;">
                  <button 
                    v-for="user in filteredUsers" 
                    :key="user.id_user" 
                    class="list-group-item list-group-item-action"
                    @click="selectUser(user)">
                    {{ user.nombre }} {{ user.paterno }} {{ user.materno }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Usuario/Equipo Actual -->
            <div class="mb-3">
              <small class="text-muted">{{ showTeamDesempeno ? 'Ranking del equipo' : 'Usuario actual' }}:</small>
              <div class="fw-bold">
                {{ showTeamDesempeno ? 'Todo el equipo' : getCurrentUserName() }}
              </div>
            </div>

            <!-- Métricas de Desempeño -->
            <div v-if="!showTeamDesempeno && desempeno.eficiencia" class="mb-3">
              <div class="text-center">
                <h4 class="text-primary">{{ desempeno.eficiencia || 0 }}</h4>
                <small class="text-muted">Eficiencia (avance/hora)</small>
              </div>
            </div>

            <!-- Vista Individual vs Ranking -->
            <div v-if="showTeamDesempeno">
              <!-- Ranking del Equipo -->
              <div class="ranking-list" style="max-height: 300px; overflow-y: auto;">
                <div v-for="(member, index) in desempenoEquipo" :key="index" 
                  class="d-flex justify-content-between align-items-center p-2 mb-2 bg-light rounded">
                  <div>
                    <span class="badge bg-primary me-2">{{ index + 1 }}</span>
                    <span class="fw-bold">{{ member.nombre }}</span>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold text-success">{{ member.eficiencia || 0 }}</div>
                    <small class="text-muted">eficiencia</small>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <!-- Gráfico Individual -->
              <canvas id="desempenoChart" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, BarController, LineController, DoughnutController, ArcElement } from 'chart.js';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

ChartJS.register(
  Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, 
  LineElement, PointElement, BarController, LineController, DoughnutController, ArcElement
);

// Configuración de API
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:4000/api';

export default {
  name: 'Dashboard',
  data() {
    return {
      // Estado general
      isLoading: false,
      error: null,
      
      // Usuario
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      selectedUser: null,
      users: [],
      
      // Búsquedas
      searchTerm: '',
      filteredUsers: [],
      searchHoras: false,
      searchProductividad: false,
      searchDesempeno: false,
      
      // Vistas de equipo
      showTeamHoras: false,
      showTeamProductividad: false,
      showTeamDesempeno: false,
      
      // Datos
      estadisticas: {},
      horasData: {
        diarias: [],
        semanales: []
      },
      productividad: {},
      desempeno: {},
      desempenoEquipo: [],
      
      // Charts
      charts: {},

      dropdownVisible: {
        horas: false,
        productividad: false,
        desempeno: false
      }
    }
  },
  computed: {
    userId() {
      return this.selectedUser?.id_user || this.currentUser?.id;
    }
  },
  async mounted() {
    await this.initializeDashboard();
  },
  beforeUnmount() {
    this.destroyAllCharts();
    document.removeEventListener('click', this.setupDropdownCloseListener)

  },
  // mounted() {
  //   this.setupDropdownCloseListener()
  // },
  methods: {
    toggleDropdown(section) {
      Object.keys(this.dropdownVisible).forEach(key => {
        if (key !== section) {
          this.dropdownVisible[key] = false
        }
      })
      this.dropdownVisible[section] = !this.dropdownVisible[section]
    },

    // ========== INICIALIZACIÓN ==========
    async initializeDashboard() {
      this.isLoading = true;
      try {
        await Promise.all([
          this.loadEstadisticas(),
          this.loadUsers(),
          this.loadHorasData(),
          this.loadProductividadData(),
          this.loadDesempenoData()
        ]);
      } catch (error) {
        this.handleError('Error al cargar el dashboard', error);
      } finally {
        this.isLoading = false;
      }
    },

    // ========== MANEJO DE ERRORES ==========
    handleError(message, error) {
      console.error(message, error);
      this.error = `${message}: ${error.response?.data?.error || error.message || 'Error desconocido'}`;
    },

    // ========== DATOS API ==========
    async loadEstadisticas() {
      try {
        const response = await axios.get(`${API_BASE}/dashboard/estadisticas`);
        this.estadisticas = response.data;
      } catch (error) {
        this.handleError('Error al cargar estadísticas', error);
      }
    },

    async loadUsers() {
      if (!this.currentUser?.id) return;
      try {
        const response = await axios.get(`${API_BASE}/usuarios/trabajadores/${this.currentUser.id}`);
        this.users = response.data || [];
      } catch (error) {
        this.handleError('Error al cargar usuarios', error);
      }
    },

    async loadHorasData(userId = this.userId) {
      if (!userId) return;
      try {
        const endpoint = this.showTeamHoras 
          ? `${API_BASE}/horas-equipo/${this.currentUser.id}`
          : `${API_BASE}/horas/${userId}`;
        
        const response = await axios.get(endpoint);
        this.horasData = {
          diarias: response.data.horasDiarias || [],
          semanales: response.data.horasSemanales || []
        };
        
        await this.$nextTick();
        this.renderHorasCharts();
      } catch (error) {
        this.handleError('Error al cargar datos de horas', error);
      }
    },

    async loadProductividadData(userId = this.userId) {
      if (!userId) return;
      try {
        const endpoint = this.showTeamProductividad
          ? `${API_BASE}/productividad-equipo/${this.currentUser.id}`
          : `${API_BASE}/productividad/${userId}`;
        
        const response = await axios.get(endpoint);
        this.productividad = response.data;
        
        await this.$nextTick();
        this.renderProductividadCharts();
      } catch (error) {
        this.handleError('Error al cargar datos de productividad', error);
      }
    },

    async loadDesempenoData(userId = this.userId) {
      if (!userId) return;
      try {
        if (this.showTeamDesempeno) {
          const response = await axios.get(`${API_BASE}/desempeno-equipo/${this.currentUser.id}`);
          this.desempenoEquipo = response.data || [];
        } else {
          const response = await axios.get(`${API_BASE}/desempeno/${userId}`);
          this.desempeno = response.data || {};
          await this.$nextTick();
          this.renderDesempenoChart();
        }
      } catch (error) {
        this.handleError('Error al cargar datos de desempeño', error);
      }
    },

    // ========== INTERACCIONES UI ==========
    toggleSearch(section) {
      switch(section) {
        case 'horas':
          this.searchHoras = !this.searchHoras;
          break;
        case 'productividad':
          this.searchProductividad = !this.searchProductividad;
          break;
        case 'desempeno':
          this.searchDesempeno = !this.searchDesempeno;
          break;
      }
      
      if (!this.searchHoras && !this.searchProductividad && !this.searchDesempeno) {
        this.searchTerm = '',
        this.filteredUsers = []
      }
    },

    async toggleTeamView(section) {

      this.dropdownVisible[section] = false

      switch(section) {
        case 'horas':
          this.showTeamHoras = !this.showTeamHoras;
          await this.loadHorasData();
          break;
        case 'productividad':
          this.showTeamProductividad = !this.showTeamProductividad;
          await this.loadProductividadData();
          break;
        case 'desempeno':
          this.showTeamDesempeno = !this.showTeamDesempeno;
          await this.loadDesempenoData();
          break;
      }
    },

    setupDropdownCloseListener() {
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
          Object.keys(this.dropdownVisible).forEach(key => {
            this.dropdownVisible[key] = false
          })
        }
      })
    },

    filterUsers() {
      if (!this.searchTerm.trim()) {
        this.filteredUsers = [];
        return;
      }
      
      const search = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        user.nombre.toLowerCase().includes(search) ||
        user.paterno.toLowerCase().includes(search) ||
        user.materno.toLowerCase().includes(search)
      );
    },

    async selectUser(user) {
      this.selectedUser = user;
      this.searchTerm = '';
      this.filteredUsers = [];
      
      // Recargar datos para el usuario seleccionado
      await Promise.all([
        this.loadHorasData(user.id_user),
        this.loadProductividadData(user.id_user),
        this.loadDesempenoData(user.id_user)
      ]);
    },

    // ========== UTILIDADES ==========
    getCurrentWeekRange() {
      const today = new Date()
      const day = today.getDay()

      const diffToMonday = day === 0 ? -6 : 1 - day
      const monday = new Date(today)
      monday.setHours(0, 0, 0, 0)
      monday.setDate(today.getDate() + diffToMonday)

      const friday = new Date(monday)
      friday.setDate(monday.getDate() + 4)
      friday.setHours(23, 59, 59, 999)

      return { start: monday, end: friday }
    },
    getCurrentUserName() {
      if (this.selectedUser) {
        return `${this.selectedUser.nombre} ${this.selectedUser.paterno} ${this.selectedUser.materno}`; // ✅ Corregido: name → nombre
      }
      
      if (this.currentUser) {
        return `${this.currentUser.name || ''} ${this.currentUser.paterno || ''} ${this.currentUser.materno || ''}`.trim(); // ✅ Corregido: name → nombre
      }
      
      return 'Usuario no encontrado';
    },

    getTotalHorasSemanales() {
      if (!this.horasData.semanales?.length) return 0;
      const currentWeek = this.horasData.semanales[this.horasData.semanales.length - 1];
      return currentWeek?.horas_totales || 0;
    },

    shouldShowWarning() {
      const totalHoras = this.getTotalHorasSemanales();
      const isEndOfWeek = dayjs().day() >= 4; // Jueves o viernes
      return isEndOfWeek && totalHoras < 32;
    },

    formatDate(fecha) {
      return dayjs(fecha).locale('es').format('MMM DD');
    },

    clearSearch() {
      this.searchTerm = '';
      this.filteredUsers = [];
    },

    // ========== GRÁFICOS ==========
    renderHorasCharts() {
      this.destroyChart('horasDiariasChart');
      this.destroyChart('horasSemanalesChart');

      // Gráfico Horas Diarias
      const ctxDiarias = document.getElementById('horasDiariasChart');
      const { start, end } = this.getCurrentWeekRange()
    
      // console.log("Datos antes del filtro:", this.horasData.diarias)

      const diariasSemana = this.horasData.diarias.filter(d => {
        if (!d.dia || typeof d.dia !== 'string') {
          console.warn("Fecha inválida en:", d)
          return false
        }

        // Extraer solo la parte de la fecha del formato ISO
        const fechaStr = d.dia.split('T')[0]
        const [year, month, day] = fechaStr.split("-").map(Number)
        const fecha = new Date(year, month - 1, day)
        if (isNaN(fecha.getTime())) {
          console.warn("Fecha no válida:", d.dia)
          return false
        }
        console.log("Fecha procesada:", fecha, "Rango:", start, end)
        return fecha >= start && fecha <= end
      })
      // console.log("Rango semana:", start, end)
      // console.log("Filtradas semana:", diariasSemana)
      
      if (ctxDiarias && diariasSemana.length > 0) {

        ctxDiarias.style.height = '200px'
        ctxDiarias.style.width = '100%'

        this.charts.horasDiariasChart = new ChartJS(ctxDiarias, {
          type: 'bar',
          data: {
            labels: diariasSemana.map(d => this.formatDate(d.dia)),
            datasets: [{
              label: 'Horas trabajadas',
              data: diariasSemana.map(d => d.horas_totales || 0), 
              backgroundColor: diariasSemana.map(d => {
                const hours = parseFloat(d.horas_totales) || 0
                if (hours > 8) return '#28a745'
                if (hours === 8) return '#007bff'
                return '#dc3545'
              }),
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                // suggestedMax: Math.max(...this.horasData.diarias.map(d => d.horas_totales || 0)) * 1.2
              },
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 45
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            },
            layout: {
              padding: {
                top: 10,
                bottom: 10
              }
            }
          }
        });
      }

      // Gráfico Horas Semanales
      const ctxSemanales = document.getElementById('horasSemanalesChart');
      if (ctxSemanales && this.horasData.semanales && this.horasData.semanales.length > 0) {

        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        
        const parseDate = (dateStr) => {
          const [day, month] = dateStr.split('-').map(Number)
          return new Date(currentYear, month - 1, day)
        }

        const filteredSemanales = this.horasData.semanales.filter(s => {
          const startDate =parseDate(s.inicio_semana)
          const endDate = parseDate(s.fin_semana)
          return startDate.getMonth() === currentMonth || endDate.getMonth() === currentMonth
        })

        const monthNames = [ 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
        const labels = filteredSemanales.map(s => {
          const [startDay] = s.inicio_semana.split('-')
          const [endDay, endMonth] = s.fin_semana.split('-')
          return `${startDay} al ${endDay} ${monthNames[Number(endMonth) - 1]}`
        })

        ctxSemanales.style.height = '200px'
        ctxSemanales.style.width = '100px'

        this.charts.horasSemanalesChart = new ChartJS(ctxSemanales, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Horas',
              data: filteredSemanales.map(s => s.horas_totales || 0),
              backgroundColor: filteredSemanales.map(s => {
                const hours = parseFloat(s.horas_totales) || 0
                if (hours > 40) return '#28a745'
                if (hours === 40) return '#007bff'
                return '#dc3545'
              }),
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              // beginAtZero: true,
              // suggestedMax: Math.max(...this.horasData.semanales.map(s => s.horas_totales || 0)) * 1.2
            },
            plugins: {
              legend: {
                display: false
              }
            },
            layout: {
              padding: {
                top: 10,
                bottom: 10
              }
            }
          }
        });
      }
    },

    // ✅ NUEVO MÉTODO: Gráficos de productividad
    renderProductividadCharts() {
      this.destroyChart('productividadTareasChart');
      this.destroyChart('productividadAvanceChart');
      this.destroyChart('productividadMetaChart');

      // Gráfico de Tareas
      const ctxTareas = document.getElementById('productividadTareasChart');
      if (ctxTareas) {
        this.charts.productividadTareasChart = new ChartJS(ctxTareas, {
          type: 'doughnut',
          data: {
            labels: ['Completadas', 'Pendientes'],
            datasets: [{
              data: [
                this.productividad.tareas_completadas || 0,
                this.productividad.tareas_pendientes || 0
              ],
              backgroundColor: ['#198754', '#ffc107'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }

      // Gráfico de Avance Semanal
      const ctxAvance = document.getElementById('productividadAvanceChart');
      if (ctxAvance && this.productividad.weekly) {
        this.charts.productividadAvanceChart = new ChartJS(ctxAvance, {
          type: 'line',
          data: {
            labels: this.productividad.weekly.map(w => `Sem ${w.semana}`),
            datasets: [{
              label: 'Avance %',
              data: this.productividad.weekly.map(w => w.promedio_avance || 0),
              borderColor: '#0d6efd',
              tension: 0.3,
              fill: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }

      // Gráfico de Meta de Horas
      const ctxMeta = document.getElementById('productividadMetaChart');
      if (ctxMeta) {
        const porcentajeHoras = this.productividad.porcentaje_horas || 0;
        this.charts.productividadMetaChart = new ChartJS(ctxMeta, {
          type: 'doughnut',
          data: {
            labels: ['Cumplido', 'Restante'],
            datasets: [{
              data: [porcentajeHoras, Math.max(0, 100 - porcentajeHoras)],
              backgroundColor: ['#fd7e14', '#e9ecef'],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '50%',
            plugins: {
              legend: {
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.label + ': ' + context.parsed + '%';
                  }
                }
              }
            }
          }
        });
      }
    },

    renderDesempenoChart() {
      this.destroyChart('desempenoChart');

      const ctxDesempeno = document.getElementById('desempenoChart');
      if (ctxDesempeno && this.desempeno.horas_totales) {
        this.charts.desempenoChart = new ChartJS(ctxDesempeno, {
          type: 'bar',
          data: {
            labels: ['Horas Totales', 'Avance Total', 'Eficiencia x10'],
            datasets: [{
              label: 'Métricas',
              data: [
                this.desempeno.horas_totales || 0,
                this.desempeno.avance_total || 0,
                (this.desempeno.eficiencia || 0) * 10 // Escalado para visualización
              ],
              backgroundColor: ['#0d6efd', '#198754', '#dc3545'],
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    if (context.dataIndex === 2) {
                      return 'Eficiencia: ' + (context.parsed.y / 10).toFixed(2);
                    }
                    return context.label + ': ' + context.parsed.y;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    },

    destroyChart(chartName) {
      if (this.charts[chartName]) {
        this.charts[chartName].destroy();
        delete this.charts[chartName];
      }
    },

    destroyAllCharts() {
      Object.keys(this.charts).forEach(chartName => {
        this.destroyChart(chartName);
      });
    }
  },
  
  watch: {
    // Limpiar búsqueda cuando se ocultan los buscadores
    searchHoras(newVal) {
      if (!newVal && !this.searchProductividad && !this.searchDesempeno) {
        this.searchTerm = '';
        this.filteredUsers = [];
      }
    },
    searchProductividad(newVal) {
      if (!newVal && !this.searchHoras && !this.searchDesempeno) {
        this.searchTerm = '';
        this.filteredUsers = [];
      }
    },
    searchDesempeno(newVal) {
      if (!newVal && !this.searchHoras && !this.searchProductividad) {
        this.searchTerm = '';
        this.filteredUsers = [];
      }
    }
  }
}
</script>

<style scoped>
/* Estilos personalizados */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.carousel-control-prev,
.carousel-control-next {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(0,0,0,0.5);
  top: 50%;
  transform: translateY(-50%);
}

.carousel-control-prev {
  left: 10px;
}

.carousel-control-next {
  right: 10px;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  width: 12px;
  height: 12px;
}

.carousel-indicators {
  bottom: -30px;
}

.carousel-indicators [data-bs-target] {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 3px;
}

.ranking-list {
  max-height: 350px;
  overflow-y: auto;
}

.ranking-list::-webkit-scrollbar {
  width: 4px;
}

.ranking-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.ranking-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.ranking-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.list-group {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  overflow: hidden;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.alert {
  border-radius: 10px;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-view > * {
  animation: fadeIn 0.6s ease forwards;
}

/* Responsive */
@media (max-width: 768px) {
  .carousel-control-prev,
  .carousel-control-next {
    display: none;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .h6, h6 {
    font-size: 0.9rem;
  }
}

/* Canvas responsivo */
canvas {
  max-width: 100% !important;
  height: auto !important;
}

/* Mejoras visuales para dropdowns */
.dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.dropdown-item {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

/* Badges mejorados */
.badge {
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Botones mejorados */
.btn-sm {
  padding: 4px 8px;
  font-size: 0.8rem;
  border-radius: 6px;
}

.btn-outline-primary:hover,
.btn-outline-secondary:hover {
  transform: translateY(-1px);
}
</style>