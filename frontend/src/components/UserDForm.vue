<template>
    <!-- Overlay con backdrop blur -->
    <div class="modal-overlay">
        <div class="delete-modal">
            <!-- Header con animación de entrada -->
            <div class="modal-header">
                <div class="warning-icon">
                    <i class="bi bi-exclamation-triangle-fill fs-2"></i>
                </div>
                <h2 class="modal-title">Eliminar Usuario</h2>
                <p class="modal-subtitle">Esta acción no se puede deshacer</p>
            </div>

            <!-- User Info Card -->
            <div class="user-preview-card">
                <div class="user-avatar">
                    <span class="avatar-initials">
                        {{ getInitials(datos.nombre) }}
                    </span>
                </div>
                <div class="user-details">
                    <h3 class="user-name">{{ datos.nombre }}</h3>
                    <div class="user-contact">
                        <div class="contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>{{ datos.email }}</span>
                        </div>
                        <div class="contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>{{ datos.telefono }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Warning Message -->
            <div class="warning-message">
                <div class="warning-content">
                    <h4>⚠️ Advertencia</h4>
                    <p>Al eliminar este usuario se perderán permanentemente todos sus datos asociados. Esta acción no se puede revertir.</p>
                </div>
            </div>

            <!-- Action Buttons -->
            <form @submit.prevent="handleSaved" class="action-form">
                <div class="button-group">
                    <button type="button" @click="$emit('cancel')" class="btn btn-cancel">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-delete" :disabled="isDeleting">
                        <div v-if="isDeleting" class="loading-spinner"></div>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        {{ isDeleting ? 'Eliminando...' : 'Eliminar Usuario' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { useToast } from 'vue-toastification'
import { h } from 'vue'
import CustomToast from './CustomToast.vue'

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id

export default {
  name: 'UserDeleteForm',
  components: {
    CustomToast
  },
  props: {
    initialData: {
      type: Object,
      default: () => ({ 
        id: '', 
        nombre: '', 
        email: '',
        telefono: ''
      })
    }
  },
  emits: ['saved', 'cancel'],
  data() {
    return {
      datos: {
        id: '', 
        nombre: '', 
        email: '',
        telefono: ''
      },
      isDeleting: false
    }
  },
  mounted() {
    this.datos = { ...this.initialData }
    // Animación de entrada
    this.$nextTick(() => {
      const modal = this.$el.querySelector('.delete-modal')
      modal.style.transform = 'scale(0.8) translateY(-20px)'
      modal.style.opacity = '0'
      
      setTimeout(() => {
        modal.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        modal.style.transform = 'scale(1) translateY(0)'
        modal.style.opacity = '1'
      }, 50)
    })
  },
  methods: {
    getInitials(name) {
      return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
    
    async handleSaved() {
      const toast = useToast()
      this.isDeleting = true
      
      try {
        const response = await fetch(`http://localhost:4000/api/users/delete/${this.datos.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 409) {
            toast.error(
              h(CustomToast, {
                title: 'Error',
                message: 'No se pudo eliminar al usuario'
              })
            )
          }
          throw new Error(errorData.error || 'No se pudo eliminar')
        }
        
        const result = await response.json()
        
        // Animación de éxito
        const modal = this.$el.querySelector('.delete-modal')
        modal.style.transform = 'scale(0.95)'
        
        setTimeout(() => {
          toast.success(
            h(CustomToast, {
              title: 'Usuario eliminado correctamente'
            })
          )
          this.$emit('saved', result.deletedUser)
        }, 200)
        
      } catch (error) {
        toast.warning(
          h(CustomToast, {
            title: 'Algo salió mal',
            message: 'Por favor intenta más tarde'
          })
        )
      } finally {
        this.isDeleting = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.delete-modal {
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%);
  border-bottom: 1px solid #fee2e2;
}

.warning-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 80px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 50%;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 0.5rem;
}

.modal-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.user-preview-card {
  margin: 1.5rem 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-initials {
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem;
}

.user-contact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.contact-item svg {
  flex-shrink: 0;
}

.warning-message {
  margin: 0 2rem 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef3cd 0%, #fde68a 100%);
  border-radius: 12px;
  border-left: 4px solid #f59e0b;
}

.warning-content h4 {
  color: #92400e;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.warning-content p {
  color: #78350f;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.action-form {
  padding: 0 2rem 2rem;
}

.button-group {
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f8fafc;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.btn-cancel:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.btn-delete {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .delete-modal {
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .user-preview-card {
    margin: 1rem 1.5rem;
    padding: 1rem;
  }
  
  .warning-message {
    margin: 0 1.5rem 1rem;
  }
  
  .action-form {
    padding: 0 1.5rem 1.5rem;
  }
  
  .button-group {
    flex-direction: column-reverse;
  }
  
  .user-preview-card {
    flex-direction: column;
    text-align: center;
  }
  
  .user-contact {
    align-items: center;
  }
}

/* Animaciones de entrada */
@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.user-preview-card {
  animation: slideInUp 0.4s ease 0.1s both;
}

.warning-message {
  animation: slideInUp 0.4s ease 0.2s both;
}

.action-form {
  animation: slideInUp 0.4s ease 0.3s both;
}
</style>