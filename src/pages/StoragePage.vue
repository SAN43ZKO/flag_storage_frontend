<template>
  <div>
    <div class="page-header">
      <h1>Складской учёт</h1>
      <button @click="openCreateModal">+ Добавить товар</button>
    </div>
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по названию или артикулу"
      />
    </div>

    <ProductTable
      :products="products"
      :loading="loading"
      @edit="openEditModal"
      @delete="onDeleteRequest"
      @add="openCreateModal"
      @preview="handlePreview"
    />

    <ProductModal
      v-if="showModal"
      :product="editingProduct"
      @close="closeModal"
      @save="handleSave"
      @preview="handlePreview"
      @update:product="onProductUpdate"
    />

    <ImagePreviewModal
      v-if="previewPath"
      :imagePath="previewPath"
      @close="previewPath = null"
    />

    <!-- Модальное окно подтверждения удаления товара -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal modal-square">
        <div class="modal-icon">
          <svg class="icon icon-large" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
        <h2>Удалить товар?</h2>
        <p class="file-name">{{ deleteTarget?.name }}</p>
        <p class="hint">Это действие нельзя отменить</p>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="secondary">Отмена</button>
          <button @click="confirmDelete" class="danger">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductTable from '../components/ProductTable.vue'
import ProductModal from '../components/ProductModal.vue'
import ImagePreviewModal from '../components/ImagePreviewModal.vue'
import { api } from '../api.js'

const route = useRoute()
const router = useRouter()

const products = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingProduct = ref(null)
const searchQuery = ref('')
const previewPath = ref(null)

// для модалки удаления
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

let debounceTimer
watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchProducts(newVal)
  }, 300)
})

async function fetchProducts(search = '') {
  loading.value = true
  try {
    products.value = await api.list(search)
    if (route.query.edit) {
      const id = Number(route.query.edit)
      if (!isNaN(id)) {
        const target = products.value.find(p => p.id === id)
        if (target) {
          editingProduct.value = { ...target }
          showModal.value = true
        }
      }
      router.replace({ query: {} })
    }
  } catch (e) {
    alert('Ошибка загрузки: ' + e.message)
    products.value = []
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingProduct.value = null
  showModal.value = true
}

function openEditModal(product) {
  editingProduct.value = { ...product }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
}

async function handleSave(formData) {
  try {
    if (editingProduct.value?.id) {
      await api.update(editingProduct.value.id, formData)
    } else {
      await api.create(formData)
    }
    await fetchProducts(searchQuery.value)
    closeModal()
  } catch (e) {
    alert('Ошибка сохранения: ' + e.message)
  }
}

// Вместо confirm открываем модалку
function onDeleteRequest(product) {
  deleteTarget.value = product
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteTarget.value = null
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await api.delete(deleteTarget.value.id)
    await fetchProducts(searchQuery.value)
  } catch (e) {
    alert('Ошибка удаления: ' + e.message)
  } finally {
    closeDeleteModal()
  }
}

function handlePreview(imagePath) {
  previewPath.value = imagePath
}

function onProductUpdate(updatedProduct) {
  editingProduct.value = updatedProduct
  const idx = products.value.findIndex(p => p.id === updatedProduct.id)
  if (idx !== -1) {
    products.value[idx] = updatedProduct
  }
}

onMounted(() => fetchProducts())
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
h1 { font-size: 24px; font-weight: 600; }
.search-bar {
  margin-bottom: 16px;
}
.search-bar input {
  width: 100%;
  padding: 10px 14px;
  font-size: 15px;
}

/* стили модалки удаления (такие же, как в DocumentsPage) */
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
  padding: 24px;
  border-radius: var(--radius);
  min-width: 360px;
}
.modal-square {
  padding: 32px;
  border-radius: 16px;
  min-width: 360px;
  max-width: 400px;
  text-align: center;
}
.modal-icon {
  margin-bottom: 16px;
  color: var(--danger);
}
.icon-large {
  width: 48px;
  height: 48px;
}
.file-name {
  font-weight: 600;
  margin: 8px 0;
  word-break: break-all;
}
.hint {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
button.secondary {
  background: #555;
}
button.danger {
  background: var(--danger);
}
</style>
