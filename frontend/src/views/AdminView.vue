<template>
  <div class="content-view">

      <!-- Encabezado responsive -->
      <!-- <div class="d-flex justify-content-end align-items-center mb-4">

        <div class="row">
          <div class="col">
            <input type="date" class="form-control">
          </div>
          <div class="col">
            <input type="date" class="form-control">
          </div>
          <div class="col">
            <button type="button" class="btn form-label border" style="background-color: #93134c; color: white;">Exportar</button>
          </div>
        </div>
      </div> -->


      
      
      <div class="input-group mb-3 d-flex justify-content-end ">
        <input ref="datePicker" type="text" class="form-control" placeholder="Selecciona rango de fechas" aria-label="Recipient’s username" aria-describedby="button-addon2">
        <button class="btn btn-outline-success" type="button">Exportar</button>
      </div>

      
 
    

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

    <!-- ----------------------------------------------------------- -->
                        <!-- HORAS Y ASISTENCIAS -->
    <!-- ----------------------------------------------------------- -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card rounded-4">
          <div class="card-body">
            <div>
              <div class="d-flex justify-content-between">
                <div class="title">
                  <h5 class="card-title">Horas y asistencia</h5>
                </div>
                <div>
                  <button class="btn btn-outline-dark border-0"><i class="bi bi-search"></i></button>
                  <button class="btn btn-outline-dark border-0">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                </div>
              </div>
              <h6><span class="badge text-bg-secondary">10</span> Hrs trabajadas</h6>
            </div>
            <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
            <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
          </div>
          <img src="..." class="card-img-bottom" alt="...">
        </div>
      </div>

    <!-- ----------------------------------------------------------- -->
                        <!-- PRODUCTIVIDAD Y AVANCE  -->
    <!-- ----------------------------------------------------------- -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title">Productividad y avance</h5>
            <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
            <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
          </div>
          <img src="..." class="card-img-bottom" alt="...">
        </div>
      </div>

    <!-- ----------------------------------------------------------- -->
                        <!-- DESEMPEÑO -->
    <!-- ----------------------------------------------------------- -->
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card rounded-4">
          <div class="card-body">
            <h5 class="card-title">Desempeño</h5>
            <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
            <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
          </div>
          <img src="..." class="card-img-bottom" alt="...">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import flatpickr from 'flatpickr';
import { Spanish } from "flatpickr/dist/l10n/es.js";
import 'flatpickr/dist/flatpickr.min.css';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
Chart.register(PieController, ArcElement, Tooltip, Legend);

export default {
  data() {
    return {
      tareasCompletadas: 0,
      tareasEnProceso: 0,
      totalActividades: 0

    }
  },
  mounted() {
    new Chart(this.$refs.progresChart, {
      type: 'doughnut',
      data: {
        labels: ['Terminadas', 'En Proceso', 'Pendientes'],
        datasets: [{
          data: [400, 30, 100],
          backgroundColor: ['#6ee7b7', '#60a5fa', '#d1d5db'],
          borderWidth: 1,
        }],
      }
    }),
    flatpickr(this.$refs.datePicker, {
      locale: Spanish,
      mode: "range",
      dateFormat: "d-m-Y",
      minDate: "today",
      showMonths: 1,
      static: true,
    });

    this.cargarEstadisticas()
  },
  methods: {
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