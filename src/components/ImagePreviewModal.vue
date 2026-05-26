<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-preview">
      <img :src="`/products/images/${imagePath}`" class="full-image" alt="preview" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  imagePath: String,
})
defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
}
.modal-preview {
  max-width: 90vw;
  max-height: 90vh;
}
.full-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}
</style>
