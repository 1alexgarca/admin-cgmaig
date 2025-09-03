<template>
  <div class="content-view">
    <!-- Header Section -->
    <div class="header-section mb-5">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="page-title mb-1">Historial de reportes</h2>
          <p class="page-subtitle">Gestiona y descarga tus reportes generados</p>
        </div>
        <div class="header-badge">
          <span class="badge bg-primary-subtle text-primary fs-6">
            {{ reportes.length }} reportes encontrados
          </span>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-section">
      <div class="table-container">
        <div class="table-header p-4">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="table-title mb-0">
              <i class="bi bi-file-earmark-text me-2"></i>
              Lista de Reportes
            </h5>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-header-bg">
              <tr>
                <th scope="col" class="table-th">
                  <div class="th-content">
                    <i class="bi bi-file-earmark me-2"></i>
                    Documento
                  </div>
                </th>
                <th scope="col" class="table-th">
                  <div class="th-content">
                    <i class="bi bi-calendar-event me-2"></i>
                    Fecha de creación
                  </div>
                </th>
                <th scope="col" class="table-th">
                  <div class="th-content">
                    <i class="bi bi-clock-history me-2"></i>
                    Periodo
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
              <tr v-for="reporte in reportes" :key="reporte.id" class="table-row">
                <td class="table-cell">
                  <div class="d-flex align-items-center">
                    <div class="file-icon bg-danger">
                      <i class="bi bi-file-earmark-pdf-fill text-white"></i>
                    </div>
                    <div class="ms-3">
                      <div class="file-name">{{ reporte.nombre_archivo }}</div>
                      <small class="text-muted">Documento PDF</small>
                    </div>
                  </div>
                </td>
                <td class="table-cell">
                  <div class="date-container">
                    <i class="bi bi-calendar3 text-muted me-2"></i>
                    <span class="date-text">{{ fechaForm(reporte.fecha_generacion) }}</span>
                  </div>
                </td>
                <td class="table-cell">
                  <span class="badge bg-info-subtle text-info">
                    {{ reporte.periodo }}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="action-buttons">
                    <button 
                      class="btn btn-action btn-download" 
                      @click="descargarReporte(reporte.id, reporte.nombre_archivo)"
                      title="Descargar reporte"
                    >
                      <i class="bi bi-download"></i>
                      Descargar
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="reportes.length === 0">
                <td colspan="4" class="text-center py-5">
                  <div class="empty-state-table">
                    <div class="empty-content">
                      <div class="empty-icon">
                        <i class="bi bi-file-earmark-excel display-4"></i>
                      </div>
                      <h5 class="empty-title">No hay reportes disponibles</h5>
                      <p class="empty-description">
                        Actualmente no hay reportes generados en el sistema
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
}

.page-title {
    font-weight: 700;
    color: #1e293b;
    font-size: 2rem;
}

.page-subtitle {
    font-size: 1.1rem;
    margin-bottom: 0;
    color: var(--secondary-color);
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

/* File Icon */
.file-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
}

.file-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.95rem;
}

/* Date Container */
.date-container {
    display: flex;
    align-items: center;
}

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
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--border-color);
    background: rgb(105, 28, 32);
    transition: var(--transition);
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
}

.btn-download {
    background: linear-gradient(135deg, rgb(105, 28, 32) 0%, 100%);
    color: white;
    border: none;
}

.btn-download:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

/* Badge Styles */
.badge {
    font-weight: 600;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
}

.bg-primary-subtle { background-color: var(--primary-light) !important; }
.bg-info-subtle { background-color: var(--info-light) !important; }

/* Empty State */
.empty-state-table {
    padding: 3rem 1rem;
    text-align: center;
}

.empty-content {
    max-width: 300px;
    margin: 0 auto;
}

.empty-icon i {
    font-size: 3rem;
    color: #d1d5db;
}

.empty-title {
    color: #374151;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
}

.empty-description {
    color: var(--secondary-color);
    margin-bottom: 1rem;
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

.header-section,
.table-section {
    animation: fadeInUp 0.6s ease forwards;
}

.table-row {
    animation: fadeInUp 0.4s ease forwards;
}

.table-row:nth-child(odd) { animation-delay: 0.1s; }
.table-row:nth-child(even) { animation-delay: 0.15s; }

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
    
    .table-th,
    .table-cell {
        padding: 0.75rem;
        font-size: 0.875rem;
    }
    
    .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .btn-action {
        width: 100%;
    }
}

@media (max-width: 576px) {
    .table-row:hover {
        transform: none;
    }
    
    .table-responsive {
        font-size: 0.8rem;
    }
    
    .file-icon {
        width: 35px;
        height: 35px;
        font-size: 1rem;
    }
    
    .file-name {
        font-size: 0.85rem;
    }
}
</style>