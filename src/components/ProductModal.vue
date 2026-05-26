<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>{{ isEdit ? 'Редактировать товар' : 'Новый товар' }}</h2>
      <form @submit.prevent="handleSubmit">
        <label>
          Название
          <input v-model="form.name" required />
        </label>
        <label>
          Артикул
          <input v-model="form.sku" required />
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

        <!-- Секция изображения (только при редактировании) -->
        <div v-if="isEdit" class="image-section">
          <label>Изображение</label>
          <div class="image-preview" @click="form.image_path && previewImage()">
            <img
              v-if="form.image_path"
              :src="`/products/images/${form.image_path}`"
              class="preview-img"
              alt=""
            />
            <div v-else class="no-image">—</div>
          </div>
          <div class="image-actions">
            <label class="file-label">
              Загрузить
              <input type="file" accept="image/*" @change="onImageSelected" hidden />
            </label>
            <button
              type="button"
              class="danger"
              @click="removeImage"
              :disabled="!form.image_path"
            >
              Удалить
            </button>
          </div>
          <p v-if="imageError" class="error">{{ imageError }}</p>
        </div>

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
import { api } from '../api.js'

const props = defineProps({
  product: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save', 'preview'])

const isEdit = computed(() => !!props.product?.id)

const form = ref({
  name: props.product?.name || '',
  sku: props.product?.sku || '',
  quantity: props.product?.quantity || 0,
  category: props.product?.category || '',
  unit: props.product?.unit || '',
  image_path: props.product?.image_path || '',
})

const imageError = ref('')

function increment() {
  form.value.quantity++
}

function decrement() {
  if (form.value.quantity > 0) {
    form.value.quantity--
  }
}

async function onImageSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)

  try {
    const resp = await fetch(`/products/${props.product.id}/image`, {
      method: 'POST',
      body: formData,
    })
    if (!resp.ok) throw new Error('Upload failed')
    const data = await resp.json()
    form.value.image_path = data.image_path
    imageError.value = ''
  } catch (e) {
    imageError.value = 'Ошибка загрузки'
  } finally {
    event.target.value = ''
  }
}

async function removeImage() {
  if (!form.value.image_path) return
  try {
    // Обновляем товар, передавая пустой image_path
    await api.update(props.product.id, { ...form.value, image_path: '' })
    form.value.image_path = ''
    imageError.value = ''
  } catch (e) {
    imageError.value = 'Ошибка удаления'
  }
}

function previewImage() {
  if (form.value.image_path) {
    emit('preview', form.value.image_path)
  }
}

function handleSubmit() {
  emit('save', { ...form.value, quantity: Number(form.value.quantity) })
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
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.qty-input[type=number] {
  -moz-appearance: textfield;
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
.error {
  color: var(--danger);
  margin-top: 8px;
}
/* Секция изображения */
.image-section {
  margin-top: 16px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}
.image-preview {
  width: 80px;
  height: 80px;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
  cursor: pointer;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-image {
  font-size: 20px;
  color: var(--text-secondary);
}
.image-actions {
  display: flex;
  gap: 8px;
}
.file-label {
  background: var(--primary);
  color: #fff;
  padding: 6px 12px;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 14px;
}
</style>
