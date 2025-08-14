<!-- src/components/CustomToast.vue -->
<template>
  <div class="custom-toas">
    <div>
      <span v-if="title === 'Successful'" class="text-success"></span>
      <span v-if="title === 'Something went wrong'" class="text-warning"></span>
      <span v-if="title === 'Error'" class="text-danger"></span>
    </div>
    <div class="toast-content">
      <h4 class="fw-bold">{{ title }}</h4>
      <p class="font-monospace fw-bold text-black">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomToast',
  props: {
    title: String,
    message: String,
    buttonText: String,
    buttonAction: Function
  }
}
</script>

<style scoped>
.custom-toast {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  /* background: #fff; */
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.toast-icon {
  margin-right: 10px;
}

.toast-icon i {
  font-size: 1.5rem;
}

.toast-content h4 {
  margin: 0 0 5px 0;
  font-size: 1rem;
  color: #333;
}

.toast-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.toast-btn {
  margin-top: 10px;
  padding: 5px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.toast-btn:hover {
  opacity: 0.9;
}

.text-success {
  color: #198754;
}

.text-warning {
  color: #ffc107;
}

.text-danger {
  color: #dc3545;
}
</style>
