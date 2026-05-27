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
      @delete="handleDelete"
      @add="openCreateModal"
      @preview="handlePreview"
    />

    <ProductModal
      v-if="showModal"
      :product="editingProduct"
      @close="closeModal"
      @save="handleSave"
      @preview="handlePreview"
    />

    <ImagePreviewModal
      v-if="previewPath"
      :imagePath="previewPath"
      @close="previewPath = null"
    />

    <ProductModal
      v-if="showModal"
      :product="editingProduct"
      @close="closeModal"
      @save="handleSave"
      @preview="handlePreview"
      @update:product="onProductUpdate"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import ProductTable from "../components/ProductTable.vue";
import ProductModal from "../components/ProductModal.vue";
import ImagePreviewModal from "../components/ImagePreviewModal.vue";
import { api } from "../api.js";

const products = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editingProduct = ref(null);
const searchQuery = ref("");
const previewPath = ref(null);

let debounceTimer;
watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchProducts(newVal);
  }, 300);
});

async function fetchProducts(search = "") {
  loading.value = true;
  try {
    products.value = await api.list(search);
  } catch (e) {
    alert("Ошибка загрузки: " + e.message);
    products.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  editingProduct.value = null;
  showModal.value = true;
}

function openEditModal(product) {
  editingProduct.value = { ...product };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingProduct.value = null;
}

async function handleSave(formData) {
  try {
    if (editingProduct.value?.id) {
      await api.update(editingProduct.value.id, formData);
    } else {
      await api.create(formData);
    }
    await fetchProducts(searchQuery.value);
    closeModal();
  } catch (e) {
    alert("Ошибка сохранения: " + e.message);
  }
}

async function handleDelete(product) {
  if (!confirm(`Удалить товар "${product.name}"?`)) return;
  try {
    await api.delete(product.id);
    await fetchProducts(searchQuery.value);
  } catch (e) {
    alert("Ошибка удаления: " + e.message);
  }
}

function handlePreview(imagePath) {
  previewPath.value = imagePath;
}

function onProductUpdate(updatedProduct) {
  // Обновляем объект редактирования
  editingProduct.value = updatedProduct
  // Сразу обновляем товар в общем списке, чтобы изменения отразились в таблице
  const idx = products.value.findIndex(p => p.id === updatedProduct.id)
  if (idx !== -1) {
    products.value[idx] = updatedProduct
  }
}

onMounted(() => fetchProducts());
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
h1 {
  font-size: 24px;
  font-weight: 600;
}
.search-bar {
  margin-bottom: 16px;
}
.search-bar input {
  width: 100%;
  padding: 10px 14px;
  font-size: 15px;
}
</style>
