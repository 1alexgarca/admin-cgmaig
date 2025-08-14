<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">
        <i class="bi bi-x"></i>
      </button>
      <TaskForm @saved="handleSubmit" @cancel="$emit('close')"/>
    </div>
  </div>
</template>

<script>
import TaskForm from './TaskForm.vue'

export default {
  components: { TaskForm },
  props: {
    show: Boolean
  },
  methods: {
    handleSubmit(taskData) {
      this.$emit('submit', taskData)
      this.$emit('close')
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
  width: 90%;
  max-width: 500px;
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