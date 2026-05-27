<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>{{ isEdit ? "Редактировать товар" : "Новый товар" }}</h2>
      <form @submit.prevent="handleSubmit" @keydown.enter.prevent>
        <label> Название </label>
        <input v-model="form.name" />
        <label> Артикул </label>
        <input v-model="form.sku" />
        <label> Категория </label>
        <input v-model="form.category" />
        <label> Ед. изм. </label>
        <input v-model="form.unit" />
        <label> Количество</label>
        <div class="quantity-field">
          <button
            type="button"
            class="qty-btn"
            @click="decrement"
            :disabled="form.quantity <= 0"
          >
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
        <!-- </label> -->

        <!-- Изображение (только при редактировании) -->
        <div v-if="isEdit" class="image-section">
          <label>Изображение</label>
          <div class="image-zone">
            <div
              class="preview-wrapper"
              @click="imagePath && $emit('preview', imagePath)"
            >
              <img
                v-if="imagePath"
                :src="`/products/images/${imagePath}`"
                class="preview-img"
                alt=""
              />
              <div v-else class="no-image">—</div>
            </div>
            <div class="image-controls">
              <label
                class="icon-btn"
                :class="{ disabled: uploading || saving }"
                title="Загрузить"
              >
                <input
                  type="file"
                  accept="image/*"
                  @change="onImageSelected"
                  hidden
                  :disabled="uploading || saving"
                />
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </label>
              <button
                v-if="imagePath"
                class="icon-btn danger"
                title="Удалить"
                @click="removeImage"
                :disabled="uploading || saving"
              >
                <svg class="icon" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </div>
          <p v-if="imageError" class="error">{{ imageError }}</p>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="secondary">
            Отмена
          </button>
          <button type="submit" :disabled="uploading || saving">
            {{ isEdit ? "Сохранить" : "Создать" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { api } from "../api.js";

const props = defineProps({
  product: { type: Object, default: null },
});

const emit = defineEmits(["close", "save", "preview", "update:product"]);

const isEdit = computed(() => !!props.product?.id);

// Локальное состояние изображения, независимое от props.product.image_path
const imagePath = ref(props.product?.image_path || "");

const form = ref({
  name: props.product?.name || "",
  sku: props.product?.sku || "",
  quantity: props.product?.quantity || 0,
  category: props.product?.category || "",
  unit: props.product?.unit || "",
});

const imageError = ref("");
const uploading = ref(false);
const saving = ref(false);

// При изменении пропса (например, после обновления родителем) актуализируем imagePath
watch(
  () => props.product?.image_path,
  (newVal) => {
    if (newVal && !imagePath.value) {
      imagePath.value = newVal;
    }
  },
);

function increment() {
  form.value.quantity++;
}

function decrement() {
  if (form.value.quantity > 0) form.value.quantity--;
}

async function onImageSelected(event) {
  if (uploading.value || saving.value) return;
  const file = event.target.files?.[0];
  if (!file) return;

  uploading.value = true;
  imageError.value = "";

  const formData = new FormData();
  formData.append("image", file);

  try {
    const resp = await fetch(`/products/${props.product.id}/image`, {
      method: "POST",
      body: formData,
    });
    if (!resp.ok) throw new Error("Upload failed");
    const data = await resp.json();
    imagePath.value = data.image_path;
    emit("update:product", { ...props.product, image_path: data.image_path });
  } catch (e) {
    imageError.value = "Ошибка загрузки";
  } finally {
    uploading.value = false;
    event.target.value = "";
  }
}

async function removeImage() {
  if (!imagePath.value) return;
  if (uploading.value || saving.value) return;
  saving.value = true;
  try {
    await api.update(props.product.id, {
      name: form.value.name,
      sku: form.value.sku,
      quantity: Number(form.value.quantity),
      category: form.value.category,
      unit: form.value.unit,
      image_path: "",
    });
    imagePath.value = "";
    emit("update:product", { ...props.product, image_path: "" });
    imageError.value = "";
  } catch (e) {
    imageError.value = "Ошибка удаления";
  } finally {
    saving.value = false;
  }
}

function handleSubmit() {
  if (saving.value) return;
  saving.value = true;
  const payload = {
    name: form.value.name,
    sku: form.value.sku,
    quantity: Number(form.value.quantity),
    category: form.value.category,
    unit: form.value.unit,
    image_path: imagePath.value,
  };
  console.log("Submitting form:", JSON.stringify(payload));
  emit("save", payload);
  // saving сбросится при закрытии модалки
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  margin-bottom: 5px;
  margin-top: 5px;
  font-size: 14px;
  color: var(--text-secondary);
}
input[type="text"],
input[type="number"],
.qty-input {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 8px 12px;
  border-radius: var(--radius);
  font-size: 14px;
  width: 100%;
  transition: border-color var(--transition);
}
input:focus {
  outline: none;
  border-color: var(--primary);
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
  opacity: 1;
}
.qty-btn:hover:not(:disabled) {
  background: var(--border);
  opacity: 1;
}
.qty-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.qty-input {
  width: 80px;
  text-align: center;
  font-size: 16px;
}
/* Секция изображения */
.image-section {
  margin-top: 16px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}
.image-zone {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.preview-wrapper {
  width: 80px;
  height: 80px;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--bg);
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-image {
  font-size: 24px;
  color: var(--text-secondary);
}
.image-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.icon-btn {
  background: transparent;
  border: none;
  padding: 6px;
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition:
    color var(--transition),
    background var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover:not(:disabled) {
  background: var(--border);
  color: var(--text);
}
.icon-btn.danger:hover:not(:disabled) {
  color: var(--danger);
  background: rgba(239, 83, 80, 0.1);
}
.icon-btn.disabled {
  opacity: 0.4;
  pointer-events: none;
}
.icon {
  width: 16px;
  height: 16px;
}
.error {
  color: var(--danger);
  margin-top: 8px;
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
