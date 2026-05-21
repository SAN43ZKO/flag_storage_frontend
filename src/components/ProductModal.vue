<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>{{ isEdit ? 'Редактировать товар' : 'Новый товар' }}</h2>
      <form @submit.prevent="handleSubmit">
        <label>
          Название
          <input v-model="form.name" />
        </label>
        <label>
          Артикул
          <input v-model="form.sku" />
        </label>
        <label>
          Категория
          <input v-model="form.category" />
        </label>
        <label>
          Ед. изм.
          <input v-model="form.unit" />
        </label>
        <label>
          Количество
          <div class="quantity-field">
            <button type="button" class="qty-btn" @click="decrement" :disabled="form.quantity <= 0">
              <svg class="icon" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <input
              v-model.number="form.quantity"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              required
              class="qty-input"
            />
            <button type="button" class="qty-btn" @click="increment">
              <svg class="icon" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </label>
        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="secondary">Отмена</button>
          <button type="submit">{{ isEdit ? 'Сохранить' : 'Создать' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  product: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.product?.id)

const form = ref({
  name: props.product?.name || '',
  sku: props.product?.sku || '',
  category: props.product?.category || '',
  unit: props.product?.unit || '',
  quantity: props.product?.quantity || 0,
})

function increment() {
  form.value.quantity++
}

function decrement() {
  if (form.value.quantity > 0) {
    form.value.quantity--
  }
}

function handleSubmit() {
  emit('save', {
    name: form.value.name || null,
    sku: form.value.sku || null,
    category: form.value.category || null,
    unit: form.value.unit || null,
    quantity: Number(form.value.quantity),
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: var(--surface);
  padding: 32px;
  border-radius: var(--radius);
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transition: background var(--transition);
}

h2 {
  margin-bottom: 20px;
  font-size: 20px;
}

label {
  display: block;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.quantity-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.qty-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 6px;
  border-radius: var(--radius);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition);
}

.qty-btn:hover:not(:disabled) {
  background: var(--border);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.qty-input {
  width: 80px;
  text-align: center;
  font-size: 16px;
  padding: 8px;
}

/* Убираем стандартные стрелки */
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.qty-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

button.secondary {
  background: #555;
}
</style>
