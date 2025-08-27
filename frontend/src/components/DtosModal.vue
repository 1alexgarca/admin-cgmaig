<template>
    <div 
      v-if="showModal"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-hidden="!showModal"
    >
      <div class="modal-content">
        <button class="close-btn" @click="$emit('close')" autofocus>
            <i class="bi bi-x"></i>
        </button>
        <DtosForm 
          :actividad="actividad" 
          @saved="handleSaved" 
          @cancel="$emit('close')"
        />
      </div>
    </div>
</template>


<script>
import DtosForm from './DtosForm.vue'

export default {
    components: { DtosForm },
    props: {
        showModal: Boolean,
        actividad: Object
    },
    methods: {
        handleSaved(DtosData) {
            this.$emit('saved', DtosData)
            this.$emit('close')
        }
    },
    emits: ['saved', 'close'],
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 850px;
    position: relative;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5rem;
}
</style>
