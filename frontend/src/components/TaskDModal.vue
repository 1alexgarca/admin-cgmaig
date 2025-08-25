<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content rounded-5">
      <button class="close-btn" @click="$emit('close')">
        <i class="bi bi-x"></i>
      </button>
      <TaskDForm
      :initialData="initialData"
      @saved="handleSaved" 
      @cancel="$emit('close')"/>
    </div>
  </div>
</template>

<script>
import TaskDForm from './TaskDForm.vue';

export default {
  components: { TaskDForm },
  props: {
    show: Boolean,
    initialData: Object
  },
  methods: {
    handleSaved(taskData) {
      this.$emit('saved', taskData)
      this.$emit('close')
    }
  },
  emits: ['saved', 'close'] 
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
  width: 70%;
  max-width: 550px;
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
