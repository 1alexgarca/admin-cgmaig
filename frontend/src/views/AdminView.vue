<template>
  <div class="content-view">
    <!-- Tarjetas responsive -->
    <div class="row g-3 mb-4">
      <!-- Tarjeta Totales -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card mb-3 border-0 bg-info rounded-4 shadow bg-opacity-10">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h5 class="card-title fw-bold">Actividades</h5>
              <div class="rounded-circle bg-info d-flex justify-content-center align-items-center"
                style="width: 50px; height: 50px;">
                  <i class="bi bi-journal-text text-white fs-3"></i>
              </div>
            </div>
            <h3 class="text-info fw-bold">{{ totalActividades }}</h3>
          </div>
        </div>
      </div>

      <!-- Tarjeta En proceso -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card mb-3 border-0 shadow bg-warning rounded-4 bg-opacity-10">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h5 class="card-title fw-bold">Actividades en proceso</h5>
              <div class="rounded-circle bg-warning d-flex justify-content-center align-items-center"
                style="height: 50px; width: 50px;">
                  <i class="bi bi-hourglass-split text-white fs-3"></i>
              </div>
            </div>
            <h3 class="text-warning fw-bold">{{ tareasEnProceso }}</h3>
          </div>
        </div>
      </div>

      <!-- Tarjeta Terminadas -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card mb-3 border-0 shadow bg-success rounded-4 bg-opacity-10">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h5 class="card-title fw-bold">Actividades concluidas</h5>
              <div class="rounded-circle d-flex justify-content-center align-items-center" style="background: #5CE65C; width: 50px; height: 50px;">
                <i class="bi bi-journal-check fs-3 text-white"></i>
              </div>
            </div>
            <h3 class="fw-bold" style="color:#5CE65C">{{ tareasCompletadas }}</h3>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row g-3">

      <!--------------------------------------------------------------->
                          <!-- HORAS Y ASISTENCIAS -->
      <!--------------------------------------------------------------->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card rounded-4 shadow-sm">
          <div class="card-body">
            <div>
              <!-- Encabezado con título y botones -->
              <div class="d-flex justify-content-between align-items-center">
                <div class="title">
                  <h5 class="card-title">Horas semanales</h5>
                </div>
                <div>
                  <!-- Botón de búsqueda de usuarios -->
                  <button class="btn btn-outline-dark border-0 me-2" @click="toggleSearch('horas')">
                    <i class="bi bi-search"></i>
                  </button>
                  <!-- Dropdown para mostrar datos del equipo -->
                  <div class="dropdown d-inline">
                    <button class="btn btn-outline-dark border-0" type="button" @click="toggleTeamData">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>

                    <!-- Vue controla si se muestra -->
                    <ul class="dropdown-menu" v-show="showTeamData">
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="loadTeamData">
                          Datos de todo el equipo
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Campo de búsqueda -->
              <div v-show="searchHoras || searchTerm" class="mt-2">
                <input type="text" class="form-control" placeholder="Buscar usuario por nombre o apellido" v-model="searchTerm">
                <div v-if="searchTerm && filteredUsers.length" class="list-group shadow" style=" position: absolute; cursor: pointer; z-index: 1100; width: 90%;">
                  <div v-for="user in filteredUsers" :key="user.id_user" class="list-group-item list-group-item-action" @click="selectUser(user)">
                    <small>
                      {{ user.nombre }} {{ user.paterno }} {{ user.materno }}
                    </small>
                  </div>
                </div>
                <div v-if="searchTerm && !filteredUsers.length" class="alert alert-info mt-1">
                  No se encontraron usuarios.
                </div>
              </div>

              <!-- Información del usuario seleccionado -->
              <div class="mb-2 mt-3">
                <small class="fw-bold">Nombre</small> : 
                <small class="fst-italic">{{ selectedUser ? `${selectedUser.nombre} ${selectedUser.paterno} ${selectedUser.materno}` : storedUser.fullName }}</small>
              </div>
            </div>
            <h6 class="mt-1">
              <span 
                class="badge"
                :class="{ 'text-bg-secondary': !(esViernes && totalHoras < 32),
                          'text-bg-danger': esViernes && totalHoras < 32
                }"  
              >
                {{ horasDiarias.reduce((acc, d) => acc + parseFloat(d.horas || 0), 0) }}
              </span>
              Hrs trabajadas
            </h6>

            <!-- Carrusel con gráficos -->
            <div id="carouselExample" class="carousel slide">
              <div class="carousel-inner">

                <!-- Horas Diarias -->
                <div class="carousel-item active">
                  <h5 class="fw-bold">Horas Diarias</h5>
                  <canvas id="horasDiariasChart"></canvas>
                </div>

                <!-- Horas Semanales -->
                <div class="carousel-item">
                  <h5 class="fw-bold">Horas Semanales</h5>
                  <canvas id="horasSemanalesChart"></canvas>
                </div>

                <!-- Horas Diarias del Equipo -->
                <div class="carousel-item" v-if="showTeamData">
                  <h5 class="fw-bold">Horas Diarias del Equipo</h5>
                  <canvas id="teamHorasDiariasChart"></canvas>
                </div>

                <!-- Horas Semanales del Equipo -->
                <div class="carousel-item" v-if="showTeamData">
                  <h5 class="fw-bold">Horas Semanales del Equipo</h5>
                  <canvas id="teamHorasSemanalesChart"></canvas>
                </div>

              </div>

              <!-- Controles del carrusel -->
              <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>

            <div class="alert alert-danger p-1 text-center mt-2" v-if="esViernes && totalHoras < 32">
              <small class="fst-italic">{{ selectedUser ? `${selectedUser.nombre} ${selectedUser.paterno} ${selectedUser.materno}` : storedUser.fullName }}</small>
              <small> no cumplira con las <span class="fw-bold">40 horas </span>esta semana</small>
              <!-- no cumplira con las 40 horas esta semana. -->
            </div>
          </div>
        </div>
      </div>

      <!--------------------------------------------------------------->
                          <!-- PRODUCTIVIDAD Y AVANCE  -->
      <!--------------------------------------------------------------->
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card rounded-4">
            <div class="card-body">
              <div>
                <div class="d-flex justify-content-between">
                  <div class="title">
                    <h5 class="card-title">Productividad y avance</h5>
                  </div>
                  <div>
                    <button class="btn btn-outline-dark border-0" @click="toggleSearch('productividad')">
                      <i class="bi bi-search"></i>
                    </button>
                    <!-- <button class="btn btn-outline-dark border-0">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button> -->
                  </div>
                </div>
                <!-- Campo de búsqueda -->
                <div v-show="searchProductividad" class="mt-2">
                  <input type="text" class="form-control" placeholder="Buscar persona" v-model="productividadSearch">
                </div>
              </div>
              <div class="mb-2 mt-3">
                <small class="fw-bold">Nombre</small> : 
                <small class="fst-italic">{{ storedUser.fullName }}</small>
              </div>
            </div>
          </div>
        </div>

      <!--------------------------------------------------------------->
                          <!-- DESEMPEÑO -->
      <!--------------------------------------------------------------->
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card rounded-4">
            <div class="card-body">
              <div>
                <div class="d-flex justify-content-between">
                  <div class="title">
                    <h5 class="card-title">Desempeño</h5>
                  </div>
                  <div>
                    <button class="btn btn-outline-dark border-0" @click="toggleSearch('desempeño')">
                      <i class="bi bi-search"></i>
                    </button>
                    <button class="btn btn-outline-dark border-0">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                  </div>
                </div>          
                <!-- Campo de búsqueda -->
                <div v-show="searchDesempeño" class="mt-2">
                  <input type="text" class="form-control" placeholder="Buscar persona" v-model="desempeñoSearch">
                </div>
              </div>
              
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import 'flatpickr/dist/flatpickr.min.css';
import axios from 'axios';
import { ref, computed } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, BarController, LineController } from 'chart.js';
import dayjs from 'dayjs'
import 'dayjs/locale/es'


ChartJS.register(
  Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement,
  BarController, LineController
);


const user = JSON.parse(localStorage.getItem('user'));
const userId = user?.id;

export default {
  data() {
    return {
      tareasCompletadas: 0,
      tareasEnProceso: 0,
      totalActividades: 0,
      searchHoras: false,
      searchDesempeño: false,
      searchProductividad: false,
      desempeñoSearch: '',
      productividadSearch: '',
      horasSearch: '',
      storedUser: user || { fullName: 'Usuario no encontrado' },

      // Datos de usuarios y gráficos
      users: [],
      selectedUser: null,
      searchTerm: '',
      horasDiarias: [],
      horasSemanales: [],
      teamHorasDiarias: [],
      teamHorasSemanales: [],
      showTeamData: false,

      // Referencias de gráficos
      horasDiariasChart: null,
      horasSemanalesChart: null,
      teamHorasDiariasChart: null,
      teamHorasSemanalesChart: null
    }
  },
  computed: {
    filteredUsers() {
      if (!this.searchTerm) return [];
      return this.users.filter(user => {
        const search = this.searchTerm.toLowerCase();
        return user.nombre.toLowerCase().includes(search) ||
               user.materno.toLowerCase().includes(search) ||
               user.paterno.toLowerCase().includes(search);
      });
    },
    totalHoras() {
      return this.horasDiarias.reduce((acc, d) => acc + parseFloat(d.horas || 0), 0)
    },
    esViernes() {
      return dayjs().day() === 5
    }
  },
  mounted() {
    this.cargarEstadisticas();
    this.loadUsers();
    this.loadData(userId);
    if (user) {
      this.storedUser.fullName = `${user.name} ${user.paterno} ${user.materno}`;
    }
  },
  methods: {
    toggleSearch(section){
      if (section === 'horas') this.searchHoras = !this.searchHoras;
      if (section === 'desempeño') this.searchDesempeño = !this.searchDesempeño;
      if (section === 'productividad') this.searchProductividad = !this.searchProductividad;
    },
    
    async cargarEstadisticas() {
      try {
        const res = await axios.get('http://localhost:4000/api/dashboard/estadisticas');
        const data = res.data;
        this.tareasCompletadas = data.tareasCompletadas;
        this.tareasEnProceso = data.tareasEnProceso;
        this.totalActividades = data.totalActividades;
      } catch (error) {
        console.error('Error al cargar estadisticas:', error);
      }
    },

    async loadUsers() {
      try {
        const res = await axios.get(`http://localhost:4000/api/usuarios/trabajadores/${userId}`);
        this.users = res.data;
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    },
    
    async loadData(uId) {
      try {
        const horasDiaRes = await axios.get(`http://localhost:4000/api/horas-diarias/${uId}`);
        this.horasDiarias = horasDiaRes.data;

        const horasSemanaRes = await axios.get(`http://localhost:4000/api/horas-semanales/${uId}`);
        this.horasSemanales = horasSemanaRes.data;

        this.renderCharts();
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    },

    toggleTeamData() {
      this.showTeamData = !this.showTeamData;
    },
    async loadTeamData() {
      try {
        const teamDiaRes = await axios.get(`http://localhost:4000/api/horas-diarias-equipo/${userId}`);
        this.teamHorasDiarias = teamDiaRes.data;

        const teamSemanaRes = await axios.get(`http://localhost:4000/api/horas-semanales-equipo/${userId}`);
        this.teamHorasSemanales = teamSemanaRes.data;

        this.renderTeamCharts();
      } catch (error) {
        console.error('Error al cargar datos del equipo:', error);
      }
    },

    selectUser(user) {
      this.selectedUser = user;
      this.searchTerm = '';
      this.loadData(user.id_user);
    },

    renderCharts() {
      if (this.horasDiariasChart) this.horasDiariasChart.destroy();
      if (this.horasSemanalesChart) this.horasSemanalesChart.destroy();

      const ctxDia = document.getElementById('horasDiariasChart').getContext('2d');
      this.horasDiariasChart = new ChartJS(ctxDia, {
        type: 'bar',
        data: {
          labels: this.horasDiarias.map(d => this.fechaNew(d.dia)),
          datasets: [{
            label: 'Horas Diarias',
            data: this.horasDiarias.map(d => d.horas),
            backgroundColor: '#0d6efd'
          }]
        },
        options: { scales: { y: { beginAtZero: true, max: 8 } } }
      });

      const ctxSemana = document.getElementById('horasSemanalesChart').getContext('2d');
      this.horasSemanalesChart = new ChartJS(ctxSemana, {
        type: 'line',
        data: {
          labels: this.horasSemanales.map(s => `Semana ${s.semana}`),
          datasets: [{
            label: 'Horas Semanales',
            data: this.horasSemanales.map(s => s.horas),
            borderColor: '#0d6efd',
            fill: false
          }]
        },
        options: { scales: { y: { beginAtZero: true, max: 40 } } }
      });
    },

    renderTeamCharts() {
      if (this.teamHorasDiariasChart) this.teamHorasDiariasChart.destroy();
      if (this.teamHorasSemanalesChart) this.teamHorasSemanalesChart.destroy();

      const ctxTeamDia = document.getElementById('teamHorasDiariasChart').getContext('2d');
      this.teamHorasDiariasChart = new ChartJS(ctxTeamDia, {
        type: 'bar',
        data: {
          labels: this.teamHorasDiarias.map(d => d.dia),
          datasets: [{
            label: 'Horas Diarias del Equipo',
            data: this.teamHorasDiarias.map(d => d.horas),
            backgroundColor: '#198754'
          }]
        },
        options: { scales: { y: { beginAtZero: true } } }
      });

      const ctxTeamSemana = document.getElementById('teamHorasSemanalesChart').getContext('2d');
      this.teamHorasSemanalesChart = new ChartJS(ctxTeamSemana, {
        type: 'line',
        data: {
          labels: this.teamHorasSemanales.map(s => `Semana ${s.semana}`),
          datasets: [{
            label: 'Horas Semanales del Equipo',
            data: this.teamHorasSemanales.map(s => s.horas),
            borderColor: '#198754',
            fill: false
          }]
        },
        options: { scales: { y: { beginAtZero: true } } }
      });
    },
    fechaNew(fecha) {
      const formDate = dayjs(fecha).locale('es').format('MMM DD');
      return formDate.charAt(0).toUpperCase() + formDate.slice(1);
    }
  }
}
</script>


<style scoped>
/* Estilos adicionales para mejorar la responsividad */
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-2px);
}
</style>


