<template>
  <div class="content-view">
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
      <div class="d-flex align-items-center">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <div>
          <strong>Error:</strong> {{ error }}
        </div>
      </div>
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

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
                <p class="stats-label mb-1">Total Actividades</p>
                <h3 class="stats-value mb-0">{{ estadisticas.totalActividades }}</h3>
                <small class="text-info">
                  <i class="bi bi-circle-fill me-1"></i>
                  Actividades Registradas
                </small>
              </div>
            </div>
            <div class="stats-progress mt-3">
              <div class="progress-bar bg-info" :style="`width: ${Math.min((estadisticas.totalActividades / 50) * 100, 100)}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- En Proceso -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="stats-card card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-warning">
                <i class="bi bi-hourglass-split"></i>
              </div>
              <div class="ms-3 flex-grow-1">
                <p class="stats-label mb-1">En Proceso</p>
                <h3 class="stats-value mb-0">{{ estadisticas.tareasEnProceso }}</h3>
                <small class="text-warning">
                  <i class="bi bi-arrow-up me-1"></i>
                  Tareas Activas
                </small>
              </div>
            </div>
            <div class="stats-progress mt-3">
              <div class="progress-bar bg-warning" :style="`width: ${Math.min((estadisticas.tareasEnProceso / 20) * 100, 100)}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completadas -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="stats-card card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-success">
                <i class="bi bi-journal-check"></i>
              </div>
              <div class="ms-3 flex-grow-1">
                <p class="stats-label mb-1">Completadas</p>
                <h3 class="stats-value mb-0">{{ estadisticas.tareasCompletadas || 0 }}</h3>
                <span class="badge bg-success-subtle text-success">
                  Tareas Finalizadas
                </span>
              </div>
            </div>
            <div class="stats-progress mt-3">
              <div class="progress-bar bg-success" :style="`width: ${Math.min((estadisticas.tareasCompletadas / 30) * 100, 100)}%`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row g-4">
      <!-- SECCIÓN HORAS Y ASISTENCIAS -->
      <div class="col-12 col-lg-6">
        <div class="dashboard-section">
          <div class="section-container">
            <div class="section-header p-4">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="section-title mb-0">
                  <i class="bi bi-clock-history me-2"></i>
                  Horas y Asistencia
                </h5>
                <div class="control-buttons">
                  <button class="btn btn-outline-secondary btn-sm" @click="toggleSearch('horas')">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="section-body p-4">
              <!-- Búsqueda de Usuario -->
              <div v-show="searchHoras" class="search-section mb-3">
                <div class="search-wrapper position-relative">
                  <i class="bi bi-search search-icon"></i>
                  <input 
                    type="text" 
                    class="form-control search-input" 
                    placeholder="Buscar usuario..." 
                    v-model="searchTermHoras"
                    @input="filterUsersHoras"
                  >
                  <div v-if="filteredUserHoras.length && searchTermHoras" 
                    class="search-dropdown list-group position-absolute w-100 shadow-sm">
                    <button 
                      v-for="user in filteredUserHoras" 
                      :key="user.id_user" 
                      class="list-group-item list-group-item-action"
                      @click="selectUserHoras(user)">
                      {{ user.nombre }} {{ user.paterno }} {{ user.materno }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Usuario Seleccionado -->
              <div class="user-info-section mb-3">
                <div class="user-info">
                  <div class="user-avatar bg-primary">
                    {{ getCurrentUserName(selectedUserHoras || currentUser).charAt(0) }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ getCurrentUserName(selectedUserHoras || currentUser) }}</div>
                    <small class="user-role text-muted">Usuario actual</small>
                  </div>
                </div>
              </div>

              <!-- Resumen de Horas -->
              <div class="stats-summary mb-3">
                <div class="summary-item">
                  <span class="badge bg-primary-subtle text-primary fs-6">{{ getTotalHorasSemanales() }}</span>
                  <span class="summary-label">Horas esta semana</span>
                </div>
                <div v-if="mostrarAdvertencia" class="alert alert-warning alert-modern p-3 mt-2 d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <small>No cumplirá con las 40 horas semanales</small>
                  </div>
                  <i 
                    class="bi bi-x-lg" 
                    style="cursor: pointer;"
                    @click="cerrarAdvertencia"
                  ></i>
                </div>
              </div>

              <!-- Carrusel de Gráficos de Horas -->
              <div class="chart-section">
                <div id="carouselHoras" class="carousel slide chart-carousel" data-bs-ride="false">
                  <div class="carousel-indicators">
                    <button type="button" data-bs-target="#carouselHoras" data-bs-slide-to="0" class="active"></button>
                    <button type="button" data-bs-target="#carouselHoras" data-bs-slide-to="1"></button>
                  </div>
                  <div class="carousel-inner">
                    <!-- Horas diarias -->
                    <div class="carousel-item active">
                      <div class="chart-header">
                        <h6 class="chart-title">Horas Diarias</h6>
                      </div>
                      <div class="chart-container">
                        <canvas id="horasDiariasChart"></canvas>
                      </div>
                      <div class="chart-legend">
                        <div class="legend-item">
                          <div class="legend-color bg-primary"></div>
                          <small class="legend-text">Horas cumplidas</small>
                        </div>
                        <div class="legend-item">
                          <div class="legend-color bg-success"></div>
                          <small class="legend-text">Horas extras</small>
                        </div>
                        <div class="legend-item">
                          <div class="legend-color bg-danger"></div>
                          <small class="legend-text">No cumplió</small>
                        </div>
                      </div>
                    </div>
                    <!-- HORAS SEMANALES -->
                    <div class="carousel-item">
                      <div class="chart-header">
                        <h6 class="chart-title">Horas Semanales</h6>
                      </div>
                      <div class="chart-container">
                        <canvas id="horasSemanalesChart"></canvas>
                      </div>
                      <div class="chart-legend">
                        <div class="legend-item">
                          <div class="legend-color bg-primary"></div>
                          <small class="legend-text">Horas cumplidas</small>
                        </div>
                        <div class="legend-item">
                          <div class="legend-color bg-success"></div>
                          <small class="legend-text">Horas extras</small>
                        </div>
                        <div class="legend-item">
                          <div class="legend-color bg-danger"></div>
                          <small class="legend-text">No cumplió</small>
                        </div>
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
        </div>
      </div>

      <!-- SECCIÓN PRODUCTIVIDAD -->
      <div class="col-12 col-lg-6">
        <div class="dashboard-section">
          <div class="section-container">
            <div class="section-header p-4">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="section-title mb-0">
                  <i class="bi bi-graph-up me-2"></i>
                  Productividad
                </h5>
                <div class="control-buttons">
                  <button class="btn btn-outline-secondary btn-sm" @click="toggleSearch('productividad')">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="section-body p-4">
              <!-- Búsqueda -->
              <div v-show="searchProductividad" class="search-section mb-3">
                <div class="search-wrapper position-relative">
                  <i class="bi bi-search search-icon"></i>
                  <input 
                    type="text" 
                    class="form-control search-input" 
                    placeholder="Buscar usuario..." 
                    v-model="searchTermProd"
                    @input="filterUsersProd"
                  >
                  <div v-if="filteredUserProd.length && searchTermProd" 
                    class="search-dropdown list-group position-absolute w-100 shadow-sm">
                    <button 
                      v-for="user in filteredUserProd" 
                      :key="user.id_user" 
                      class="list-group-item list-group-item-action"
                      @click="selectUserProd(user)">
                      {{ user.nombre }} {{ user.paterno }} {{ user.materno }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Usuario Seleccionado -->
              <div class="user-info-section mb-3">
                <div class="user-info">
                  <div class="user-avatar bg-primary">
                    {{ getCurrentUserName(selectedUserProd || currentUser).charAt(0) }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ getCurrentUserName(selectedUserProd || currentUser) }}</div>
                    <small class="user-role text-muted">Usuario actual</small>
                  </div>
                </div>
              </div>

              <!-- Estadísticas Productividad -->
              <div class="productivity-stats mb-3">
                <div class="row text-center">
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-value text-success">{{ productividad.tareas_completadas || 0 }}</div>
                      <small class="stat-label text-muted">Completadas</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-value text-warning">{{ productividad.tareas_pendientes || 0 }}</div>
                      <small class="stat-label text-muted">Pendientes</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-value text-info">{{ productividad.promedio_avance || 0 }}%</div>
                      <small class="stat-label text-muted">Promedio Avance</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Carrusel Productividad -->
              <div class="chart-section">
                <div id="carouselProductividad" class="carousel slide chart-carousel" data-bs-ride="false">
                  <div class="carousel-indicators">
                    <button type="button" data-bs-target="#carouselProductividad" data-bs-slide-to="0" class="active"></button>
                    <button type="button" data-bs-target="#carouselProductividad" data-bs-slide-to="1"></button>
                  </div>
                  <div class="carousel-inner">
                    <div class="carousel-item active">
                      <div class="chart-header">
                        <h6 class="chart-title">Tareas</h6>
                      </div>
                      <div class="chart-container">
                        <canvas id="productividadTareasChart"></canvas>
                      </div>
                    </div>
                    <div class="carousel-item">
                      <div class="chart-header">
                        <h6 class="chart-title">Meta de 40 Horas Semanales</h6>
                      </div>
                      <div class="chart-container">
                        <canvas id="productividadMetaChart"></canvas>
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
      mostrarAdvertencia: false,
      // Estado general
      isLoading: false,
      error: null,
      
      // Usuario
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      selectedUserHoras: null,
      selectedUserProd: null,
      users: [],
      
      // Búsquedas
      searchHoras: false,
      searchProductividad: false,
      
      searchTermHoras: '',
      filteredUserHoras: [],
      searchTermProd: '',
      filteredUserProd: [],
      
      // Datos
      estadisticas: {},
      horasData: {
        diarias: [],
        semanales: []
      },
      productividad: {},
      
      // Charts
      charts: {}
    }
  },
  computed: {
    userId() {
      return this.selectedUser?.id_user || this.currentUser?.id;
    }
  },
  async mounted() {
    await this.initializeDashboard();
    this.mostrarAdvertencia = this.shouldShowWarning()
  },
  beforeUnmount() {
    this.destroyAllCharts();
  },
  methods: {
    // ========== INICIALIZACIÓN ==========
    async initializeDashboard() {
      this.isLoading = true;
      try {
        await Promise.all([
          this.loadEstadisticas(),
          this.loadUsers(),
          this.loadHorasData(),
          this.loadProductividadData()
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
        const response = await axios.get(`${API_BASE}/horas/${userId}`);
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
        const response = await axios.get(`${API_BASE}/productividad/${userId}`);
        this.productividad = response.data;

        await this.$nextTick();
        this.renderProductividadCharts();
      } catch (error) {
        this.handleError('Error al cargar datos de productividad', error);
      }
    },

    // ========== INTERACCIONES UI ==========
    toggleSearch(section) {
      switch(section) {
        case 'horas':
          this.searchHoras = !this.searchHoras;
          if (!this.searchHoras) this.searchTermHoras = ''; this.filteredUserHoras = [];
          break;
        case 'productividad':
          this.searchProductividad = !this.searchProductividad;
          if (!this.searchProductividad) this.searchTermProd = ''; this.filteredUserProd = [];
          break;
      }
    },

    // ---------------- HORAS ----------------
    filterUsersHoras() {
      if (this.searchTermHoras.trim() === '') {
        this.filteredUserHoras = [];
        return;
      }
      this.filteredUserHoras = this.users.filter(u =>
        `${u.nombre} ${u.paterno} ${u.materno}`
          .toLowerCase()
          .includes(this.searchTermHoras.toLowerCase())
      );
    },
    async selectUserHoras(user) {
      this.selectedUserHoras = user;
      this.searchTermHoras = '';
      this.filteredUsersHoras = [];
      this.loadHorasData(user.id_user);
    },

    // ---------------- PRODUCTIVIDAD ----------------
    filterUsersProd() {
      if (this.searchTermProd.trim() === '') {
        this.filteredUserProd = [];
        return;
      }
      this.filteredUserProd = this.users.filter(u =>
        `${u.nombre} ${u.paterno} ${u.materno}`
          .toLowerCase()
          .includes(this.searchTermProd.toLowerCase())
      );
    },
    async selectUserProd(user) {
      this.selectedUserProd = user;
      this.searchTermProd = '';
      this.filteredUsersProd = [];
      this.loadProductividadData(user.id_user);
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

    getCurrentUserName(user) {
      if (user) {
        return `${user.nombre || user.name || ''} ${user.paterno || ''} ${user.materno || ''}`.trim();
      }
      if (this.currentUser) {
        return `${this.currentUser.nombre || ''} ${this.currentUser.paterno || ''} ${this.currentUser.materno || ''}`.trim();
      }
      return 'Usuario no encontrado';
    },

    getTotalHorasSemanales() {
      if (!this.horasData.diarias?.length) return 0

      const { start, end } = this.getCurrentWeekRange()
      const diariasSemana = this.horasData.diarias.filter(d => {
        if (!d.dia || typeof d.dia !== 'string') return false

        const fechaStr = d.dia.split('T')[0]
        const [year, month, day] = fechaStr.split("-").map(Number)
        const fecha = new Date(year, month -1, day)

        return fecha >= start && fecha <= end
      })
      return diariasSemana.reduce((total, d) => total + Number(d.horas_totales || 0), 0).toFixed(2)

      // if (!this.horasData.semanales?.length) return 0;
      // const currentWeek = this.horasData.semanales[this.horasData.semanales.length - 1];
      // return currentWeek?.horas_totales || 0;
    },

    shouldShowWarning() {
      const totalHoras = this.getTotalHorasSemanales();
      const isEndOfWeek = dayjs().day() >= 4;
      return isEndOfWeek && totalHoras < 32;
    },

    cerrarAdvertencia() {
      this.mostrarAdvertencia = false
    },
    formatDate(fecha) {
      return dayjs(fecha).locale('es').format('MMM DD');
    },

    // ========== GRÁFICOS ==========
    renderHorasCharts() {
      this.destroyChart('horasDiariasChart');
      this.destroyChart('horasSemanalesChart');

      // Gráfico Horas Diarias
      const ctxDiarias = document.getElementById('horasDiariasChart');
      const { start, end } = this.getCurrentWeekRange()

      const diariasSemana = this.horasData.diarias.filter(d => {
        if (!d.dia || typeof d.dia !== 'string') {
          console.warn("Fecha inválida en:", d)
          return false
        }

        const fechaStr = d.dia.split('T')[0]
        const [year, month, day] = fechaStr.split("-").map(Number)
        const fecha = new Date(year, month - 1, day)
        if (isNaN(fecha.getTime())) {
          console.warn("Fecha no válida:", d.dia)
          return false
        }
        return fecha >= start && fecha <= end
      })
      
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

    renderProductividadCharts() {
      this.destroyChart('productividadTareasChart');
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
      if (!newVal) {
        this.searchTermHoras = '';
        this.filteredUserHoras = [];
      }
    },
    searchProductividad(newVal) {
      if (!newVal) {
        this.searchTermProd = '';
        this.filteredUserProd = [];
      }
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

/* Loading Container */
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
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

/* Dashboard Sections */
.dashboard-section {
    height: 100%;
}

.section-container {
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.section-header {
    background: linear-gradient(135deg, var(--light-bg) 0%, #f1f5f9 100%);
    border-bottom: 1px solid var(--border-color);
}

.section-title {
    font-weight: 700;
    color: #1e293b;
}

.section-body {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* Search Section */
.search-section {
    margin-bottom: 1rem;
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
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: var(--transition);
}

.search-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-dropdown {
    z-index: 1050;
    max-height: 200px;
    overflow-y: auto;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--border-color);
    margin-top: 4px;
}

.search-dropdown .list-group-item {
    border: none;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    transition: var(--transition);
}

.search-dropdown .list-group-item:hover {
    /* background-color: var(--primary-light); */
    color: var(--primary-color);
}

/* User Info Section */
.user-info-section {
    background: var(--light-bg);
    border-radius: var(--border-radius-sm);
    padding: 1rem;
}

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

/* Stats Summary */
.stats-summary {
    background: var(--light-bg);
    border-radius: var(--border-radius-sm);
    padding: 1rem;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.summary-label {
    font-size: 0.9rem;
    color: var(--secondary-color);
    font-weight: 500;
}

/* Productivity Stats */
.productivity-stats {
    background: var(--light-bg);
    border-radius: var(--border-radius-sm);
    padding: 1rem;
}

.stat-item {
    padding: 0.5rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.8rem;
}

/* Chart Section */
.chart-section {
    flex: 1;
    display: flex;
    flex-direction: column;
}


.chart-title {
    font-weight: 600;
    color: #374151;
    margin-bottom: 0;
}

.chart-container {
    position: relative;
    height: 200px;
    width: 100%;
    flex: 1;
}

.chart-container canvas {
    width: 100% !important;
    height: 200px !important;
}

.chart-legend {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.legend-color {
    width: 15px;
    height: 15px;
    border-radius: 2px;
}

.legend-text {
    font-size: 0.8rem;
    color: var(--secondary-color);
    font-style: italic;
}

/* Control Buttons */
.control-buttons .btn {
    font-weight: 500;
    transition: var(--transition);
}

.control-buttons .btn-sm {
    padding: 0.375rem 0.75rem;
    border-radius: var(--border-radius-sm);
}

/* Alert Styles */
.alert {
    border-radius: var(--border-radius);
    border: none;
}

.alert-modern {
    border-radius: var(--border-radius-sm);
    border: 1px solid #fbbf24;
}

/* Carousel Controls */
.carousel-control-prev,
.carousel-control-next {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(0,0,0,0.5);
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.8;
    transition: var(--transition);
}

.carousel-control-prev {
    left: 10px;
}

.carousel-control-next {
    right: 10px;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
    width: 12px;
    height: 12px;
}

.carousel-indicators {
    bottom: -30px;
    margin-bottom: 0;
}

.carousel-indicators [data-bs-target] {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin: 0 3px;
    background-color: var(--secondary-color);
    opacity: 0.5;
    transition: var(--transition);
}

.carousel-indicators .active {
    opacity: 1;
    background-color: var(--primary-color);
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

/* Spinner */
.spinner-border {
    width: 3rem;
    height: 3rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .content-view {
        padding: 1rem;
    }
    
    .stats-icon {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
    }
    
    .stats-value {
        font-size: 1.5rem;
    }
    
    .section-header,
    .section-body {
        padding: 1rem !important;
    }
    
    .user-avatar {
        width: 35px;
        height: 35px;
        font-size: 0.8rem;
    }
    
    .chart-container {
        height: 150px;
    }
    
    .chart-container canvas {
        height: 150px !important;
    }
    
    .chart-legend {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .carousel-control-prev,
    .carousel-control-next {
        display: none;
    }
}

@media (max-width: 576px) {
    .stats-card:hover {
        transform: none;
    }
    
    .chart-legend {
        justify-content: flex-start;
    }
    
    .legend-item {
        font-size: 0.75rem;
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
.dashboard-section {
    animation: fadeInUp 0.6s ease forwards;
}

.stats-card:nth-child(2) { animation-delay: 0.1s; }
.stats-card:nth-child(3) { animation-delay: 0.2s; }
.stats-card:nth-child(4) { animation-delay: 0.3s; }

/* Focus States */
.search-input:focus,
.btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Print Styles */
@media print {
    .section-header,
    .section-body {
        background: white !important;
        box-shadow: none !important;
    }
    
    .btn,
    .carousel-control-prev,
    .carousel-control-next {
        display: none;
    }
    
    .stats-card:hover {
        transform: none;
    }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
    :root {
        --border-color: #000;
        --secondary-color: #000;
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
    
    .stats-card:hover {
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
    .section-container {
        background: #1f2937;
        color: #f9fafb;
    }
    
    .section-header {
        background: #111827;
    }
    
    .stats-value,
    .section-title,
    .user-name {
        color: #f9fafb;
    }
    
    .search-input {
        background: #111827;
        color: #f9fafb;
        border-color: #374151;
    }
}
</style>