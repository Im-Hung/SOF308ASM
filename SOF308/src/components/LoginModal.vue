<template>
  <!-- Modal Overlay -->
  <div 
    v-if="show" 
    class="modal-overlay" 
    @click="closeModal"
  >
    <div class="modal-container" @click.stop>
      <!-- Close button -->
      <button 
        class="modal-close" 
        @click="closeModal"
        aria-label="Đóng"
      >
        <i class="fas fa-times"></i>
      </button>

      <!-- Login Component -->
      <Login 
        @login-success="handleLoginSuccess"
        @register-success="handleRegisterSuccess"
      />
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import Login from '@/views/Login.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'login-success', 'register-success']);

// Watch for show prop changes to handle body scroll
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

const closeModal = () => {
  emit('close');
};

const handleLoginSuccess = (userData) => {
  emit('login-success', userData);
};

const handleRegisterSuccess = (userData) => {
  emit('register-success', userData);
};

// Handle escape key
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.show) {
    closeModal();
  }
};

// Add/remove event listeners
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscape);
  } else {
    document.removeEventListener('keydown', handleEscape);
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-container {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  overflow-y: auto;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.modal-close:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.modal-close i {
  font-size: 1.2rem;
  color: #666;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-container {
    max-width: 100vw;
    border-radius: 15px;
  }
  
  .modal-close {
    top: 0.5rem;
    right: 0.5rem;
    width: 35px;
    height: 35px;
  }
}
</style>
