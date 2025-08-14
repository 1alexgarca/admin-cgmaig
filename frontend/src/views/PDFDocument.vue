<template>
  <div class="content-view">
    <div class="mb-4">
      <h2 class="fw-bold">Historial de reportes</h2>
    </div>
    <div class="bg-primary">
      <table class="table shadow">
        <thead>
          <tr>
            <th>Documento</th>
            <th>Fecha de creación</th>
            <th>Periodo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="reporte in reportes"
            :key="reporte.id"

          >
            <td>
              <i class="bi bi-file-earmark-pdf-fill" style="color: rgb(105, 28, 32);"></i>
              <small class="ps-2">
                {{ reporte.nombre_archivo }}
              </small>
            </td>
            <td>
              <small>
                {{ fechaForm(reporte.fecha_generacion) }}
              </small>
            </td>
            <td>
              <small>{{ reporte.periodo }}</small>
            </td>
            <td>
              <button 
                type="button" 
                class="btn btn-dark btn-sm"
                @click="descargarReporte(reporte.id, reporte.nombre_archivo)"  
              >
                <i class="bi bi-file-pdf"> Descargar</i>
              </button>
            </td>
          </tr>
          <tr v-if="reportes.length === 0">
            <td colspan="4" class="text-center">
              <small class="text-muted">Actualmente no hay reportes</small>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/es'

const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id

export default {
  data() {
    return {
      reportes: []
    }
  },
  async created() {
    await this.loadReportes()
  },
  methods: {
    async loadReportes() {
      try {
        const response = await fetch(`http://localhost:4000/api/reportes-generados/${userId}`)
        if (!response.ok) throw new Error('Error al obtener reportes')
        this.reportes = await response.json()
      } catch (error) {
        console.error('Error al cargar los reportes:', error)
      }
    },
    fechaForm(fecha_generacion) {
      const formDate = dayjs(fecha_generacion).format('MMMM DD, YYYY')
      return formDate.charAt(0).toUpperCase() + formDate.slice(1)
    },
    async descargarReporte(id, nombreArchivo) {
      try {
        const response = await fetch(`http://localhost:4000/api/reportes-generados/${id}/descargar`, {
          method: 'GET'
        })
        if (!response.ok) throw new Error('Error al descargar reporte')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', nombreArchivo)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error al descargar el reporte:', error)
      }
    }
  }
}
</script>