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
            <!-- Encabezado -->
            <div class="d-flex justify-content-between align-items-center">
              <div class="title">
                <h5 class="card-title">Horas y asistencia</h5>
              </div>
              <div>
                <!-- Botón de búsqueda -->
                <button class="btn btn-outline-dark border-0 me-2" @click="toggleSearch('horas')">
                  <i class="bi bi-search"></i>
                </button>
                <button class="btn btn-outline-dark border-0">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
              </div>
            </div>

            <!-- Campo de búsqueda -->
            <div v-show="searchHoras" class="mt-2">
              <input type="text" class="form-control" placeholder="Buscar persona" v-model="horasSearch">
            </div>

            <!-- Horas trabajadas -->
            <h6 class="mt-3">
              <span class="badge text-bg-secondary">10</span> Hrs trabajadas
            </h6>
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
                  <button class="btn btn-outline-dark border-0">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                </div>
              </div>
              <!-- Campo de búsqueda -->
              <div v-show="searchProductividad" class="mt-2">
                <input type="text" class="form-control" placeholder="Buscar persona" v-model="productividadSearch">
              </div>
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
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { ref } from 'vue'
Chart.register(PieController, ArcElement, Tooltip, Legend);

const showSearch = ref(false)

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
      horasSearch: ''
    }
  },
  mounted() {
    this.cargarEstadisticas()
  },
  methods: {
    toggleSearch(section){
      if (section === 'horas'){
        this.searchHoras = !this.searchHoras
      }
      if (section === 'desempeño') {
        this.searchDesempeño = !this.searchDesempeño
      }
      if (section === 'productividad') {
        this.searchProductividad = !this.searchProductividad
      }
    },
    async cargarEstadisticas() {
      try {
        const res = await axios.get('http://localhost:4000/api/dashboard/estadisticas')
        const data = res.data

        this.tareasCompletadas = data.tareasCompletadas
        this.tareasEnProceso = data.tareasEnProceso
        this.totalActividades = data.totalActividades

        console.log(this.tareasCompletadas)
        console.log(this.tareasEnProceso)
        console.log(this.totalActividades)

      } catch (error) {
        console.error('Error al cargar estadisticas:', error)
      
      }
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
</style>a