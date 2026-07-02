<template>
  <title>Группа Флаг | Склад</title>
  <div>
    <div class="page-header">
      <h1>Складской учёт</h1>
      <div class="header-actions">
        <button @click="openReceiptModal" class="receipt-btn">
          📦 Приёмка
        </button>
        <button @click="openCreateModal">+ Добавить товар</button>
      </div>
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
      @delete="onDeleteRequest"
    />

    <ImagePreviewModal
      v-if="previewPath"
      :imagePath="previewPath"
      @close="previewPath = null"
    />

    <!-- Модальное окно подтверждения удаления товара -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay-delete"
      @click.self="closeDeleteModal"
    >
      <div class="modal-delete modal-square-delete">
        <div class="modal-icon-delete">
          <svg
            class="icon-delete icon-large-delete"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
          >
            <polyline points="3 6 5 6 21 6" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
        <h2>Удалить товар?</h2>
        <p class="file-name-delete">{{ deleteTarget?.name }}</p>
        <p class="hint-delete">Это действие нельзя отменить</p>
        <div class="modal-actions-delete">
          <button @click="closeDeleteModal" class="secondary-delete">
            Отмена
          </button>
          <button @click="confirmDelete" class="danger-delete">Удалить</button>
        </div>
      </div>
    </div>

    <!-- Модальное окно приёмки товара -->
    <div
      v-if="showReceiptModal"
      class="modal-overlay"
      @click.self="closeReceiptModal"
    >
      <div class="modal modal-full">
        <div class="modal-header">
          <h2>Приёмка товара</h2>
          <button class="close-btn" @click="closeReceiptModal">&times;</button>
        </div>

        <div class="receipt-form">
          <div class="input-row">
            <div class="autocomplete-wrapper">
              <input
                v-model="receiptSku"
                type="text"
                placeholder="Артикул или название"
                @input="onSkuInput"
                @keydown.enter.prevent="onSkuEnter"
                list="sku-list"
                ref="receiptSkuInput"
              />
              <datalist id="sku-list">
                <option
                  v-for="item in autocompleteItems"
                  :key="item.id"
                  :value="item.sku || item.name"
                >
                  {{ item.name || item.sku }}
                </option>
              </datalist>
            </div>
            <input
              v-model="receiptQty"
              type="number"
              placeholder="Количество"
              min="1"
            />
            <input
              v-model="receiptCategory"
              type="text"
              placeholder="Категория"
              list="category-list"
            />
            <datalist id="category-list">
              <option v-for="cat in categoriesList" :key="cat" :value="cat" />
            </datalist>
            <input
              v-model="receiptUnit"
              type="text"
              placeholder="Ед. изм."
              list="unit-list"
            />
            <datalist id="unit-list">
              <option v-for="u in unitsList" :key="u" :value="u" />
            </datalist>
            <button
              @click="addReceiptItem"
              :disabled="!receiptSku || receiptQty <= 0"
            >
              Добавить
            </button>
          </div>

          <table v-if="receiptItems.length > 0">
            <thead>
              <tr>
                <th>Артикул</th>
                <th>Название (для нового)</th>
                <th>Количество</th>
                <th>Категория</th>
                <th>Ед.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in receiptItems" :key="idx">
                <td>{{ item.sku }}</td>
                <td>
                  <input
                    v-model="item.name"
                    type="text"
                    placeholder="Название нового товара"
                  />
                </td>
                <td>
                  <input v-model.number="item.quantity" type="number" min="1" />
                </td>
                <td>
                  <input
                    v-model="item.category"
                    type="text"
                    placeholder="Категория"
                  />
                </td>
                <td>
                  <input v-model="item.unit" type="text" placeholder="Ед." />
                </td>
                <td>
                  <button @click="removeReceiptItem(idx)">Удалить</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="receipt-cards">
            <div
              v-for="(item, idx) in receiptItems"
              :key="idx"
              class="receipt-card"
            >
              <div class="receipt-card-main">
                <div class="receipt-card-sku">
                  {{ item.sku || item.name || "Без названия" }}
                </div>
                <div class="receipt-card-qty">{{ item.quantity }} шт.</div>
              </div>
              <div class="receipt-card-meta">
                <input v-model="item.name" type="text" placeholder="Название" />
                <input
                  v-model="item.category"
                  type="text"
                  placeholder="Категория"
                />
                <input v-model="item.unit" type="text" placeholder="Ед." />
              </div>
              <div class="receipt-card-remove">
                <button @click="removeReceiptItem(idx)">Удалить</button>
              </div>
            </div>
          </div>

          <div v-if="receiptItems.length > 0" class="submit-row">
            <button @click="submitReceipt" :disabled="receiptSending">
              Принять товар
            </button>
          </div>

          <div v-if="receiptResult" class="result">
            <p v-if="receiptResult.created > 0">
              Создано: {{ receiptResult.created }}
            </p>
            <p v-if="receiptResult.updated > 0">
              Обновлено: {{ receiptResult.updated }}
            </p>
            <p v-if="receiptResult.errors?.length" class="error">
              <span v-for="err in receiptResult.errors" :key="err">{{
                err
              }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductTable from "../components/ProductTable.vue";
import ProductModal from "../components/ProductModal.vue";
import ImagePreviewModal from "../components/ImagePreviewModal.vue";
import { api } from "../api.js";

const route = useRoute();
const router = useRouter();

const products = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editingProduct = ref(null);
const searchQuery = ref("");
const previewPath = ref(null);

const showDeleteModal = ref(false);
const deleteTarget = ref(null);

// Приёмка
const showReceiptModal = ref(false);
const receiptSku = ref("");
const receiptQty = ref(1);
const receiptCategory = ref("");
const receiptUnit = ref("");
const receiptItems = ref([]);
const receiptSending = ref(false);
const receiptResult = ref(null);
const receiptSkuInput = ref(null);
const autocompleteItems = ref([]);
let autocompleteTimer = null;

// Справочники (загружаются асинхронно, не блокируя интерфейс)
const categoriesList = ref([]);
const unitsList = ref([]);

async function fetchAutocomplete(query) {
  if (query.length < 2) {
    autocompleteItems.value = [];
    return;
  }
  try {
    const resp = await fetch(
      `/products/autocomplete?q=${encodeURIComponent(query)}`,
    );
    const data = await resp.json();
    autocompleteItems.value = Array.isArray(data) ? data : [];
  } catch (e) {
    autocompleteItems.value = [];
  }
}

function onSkuInput(e) {
  const val = e.target.value;
  clearTimeout(autocompleteTimer);
  autocompleteTimer = setTimeout(() => fetchAutocomplete(val), 200);
}

function onSkuEnter() {
  const val = receiptSku.value.trim();
  if (!val || receiptQty.value <= 0) return;
  const match = autocompleteItems.value.find(
    (item) => item.sku === val || item.name === val,
  );
  if (match) {
    addReceiptItemFromAutocomplete(match);
  } else {
    addReceiptItem();
  }
}

function addReceiptItemFromAutocomplete(item) {
  const qty = Number(receiptQty.value);
  if (qty <= 0) return;

  // Подставляем категорию и единицу из автокомплита, если они не заданы
  if (!receiptCategory.value && item.category) {
    receiptCategory.value = item.category;
  }
  if (!receiptUnit.value && item.unit) {
    receiptUnit.value = item.unit;
  }

  const existing = receiptItems.value.find((i) => {
    if (item.sku && item.sku !== "") return i.sku === item.sku;
    return i.name === item.name;
  });
  if (existing) {
    existing.quantity += qty;
    if (receiptCategory.value) existing.category = receiptCategory.value;
    if (receiptUnit.value) existing.unit = receiptUnit.value;
  } else {
    receiptItems.value.push({
      sku: item.sku || "",
      name: item.name || "",
      quantity: qty,
      category: receiptCategory.value,
      unit: receiptUnit.value,
    });
  }
  receiptSku.value = "";
  receiptQty.value = 1;
  receiptSkuInput.value?.focus();
}

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
    if (route.query.edit) {
      const id = Number(route.query.edit);
      if (!isNaN(id)) {
        const target = products.value.find((p) => p.id === id);
        if (target) {
          editingProduct.value = { ...target };
          showModal.value = true;
        }
      }
      router.replace({ query: {} });
    }
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

function onDeleteRequest(product) {
  deleteTarget.value = product;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  deleteTarget.value = null;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  try {
    await api.delete(deleteTarget.value.id);
    await fetchProducts(searchQuery.value);
  } catch (e) {
    alert("Ошибка удаления: " + e.message);
  } finally {
    closeDeleteModal();
  }
}

function handlePreview(imagePath) {
  previewPath.value = imagePath;
}

function onProductUpdate(updatedProduct) {
  editingProduct.value = updatedProduct;
  const idx = products.value.findIndex((p) => p.id === updatedProduct.id);
  if (idx !== -1) {
    products.value[idx] = updatedProduct;
  }
}

// Методы приёмки
function openReceiptModal() {
  showReceiptModal.value = true;
  receiptResult.value = null;
  receiptItems.value = [];
  receiptSku.value = "";
  receiptQty.value = 1;
  setTimeout(() => receiptSkuInput.value?.focus(), 100);
}

function closeReceiptModal() {
  showReceiptModal.value = false;
}

function addReceiptItem() {
  const val = receiptSku.value.trim();
  const qty = Number(receiptQty.value);
  if (!val || qty <= 0) return;

  const match = autocompleteItems.value.find(
    (item) =>
      (item.sku && item.sku === val) || (item.name && item.name === val),
  );
  if (match) {
    addReceiptItemFromAutocomplete(match);
  } else {
    // старая логика добавления произвольного товара
    const existing = receiptItems.value.find(
      (i) => i.sku === val || i.name === val,
    );
    if (existing) {
      existing.quantity += qty;
      if (receiptCategory.value) existing.category = receiptCategory.value;
      if (receiptUnit.value) existing.unit = receiptUnit.value;
    } else {
      receiptItems.value.push({
        sku: val,
        name: "",
        quantity: qty,
        category: receiptCategory.value,
        unit: receiptUnit.value,
      });
    }
    receiptSku.value = "";
    receiptQty.value = 1;
    receiptCategory.value = "";
    receiptUnit.value = "";
    receiptSkuInput.value?.focus();
  }
}

function removeReceiptItem(idx) {
  receiptItems.value.splice(idx, 1);
}

async function submitReceipt() {
  receiptSending.value = true;
  receiptResult.value = null;
  try {
    const resp = await fetch("/products/receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: receiptItems.value.map((i) => ({
          sku: i.sku,
          name: i.name,
          quantity: i.quantity,
        })),
      }),
    });
    const data = await resp.json();
    receiptResult.value = data;
    if (resp.ok) {
      receiptItems.value = [];
      await fetchProducts(searchQuery.value);
    }
  } catch (e) {
    receiptResult.value = { errors: [e.message] };
  } finally {
    receiptSending.value = false;
  }
}

async function loadDictionaries() {
  try {
    const [cats, uns] = await Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/units").then((r) => r.json()),
    ]);
    categoriesList.value = cats || [];
    unitsList.value = uns || [];
  } catch (e) {
    // не страшно, если справочники не загрузятся – просто не будет подсказок
  }
}

onMounted(async () => {
  await fetchProducts(); // обязательно дождаться
  loadDictionaries(); // запустить асинхронно, без привязки к loading
});
</script>

<style scoped>
.receipt-cards {
  display: none;
}

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
.header-actions {
  display: flex;
  gap: 12px;
}
.receipt-btn {
  background: #01d70c;
  color: #fff;
  font-weight: bold;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius);
  cursor: pointer;
}
.search-bar {
  margin-bottom: 16px;
}
.search-bar input {
  width: 100%;
  padding: 10px 14px;
  font-size: 15px;
}

/* стили модалки удаления (такие же, как в DocumentsPage) */
.modal-overlay-delete {
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
.modal-delete {
  background: var(--surface);
  padding: 24px;
  border-radius: var(--radius);
  min-width: 360px;
}
.modal-square-delete {
  padding: 32px;
  border-radius: 16px;
  min-width: 360px;
  max-width: 400px;
  text-align: center;
}
.modal-icon-delete {
  margin-bottom: 16px;
  color: var(--danger);
}
.icon-large-delete {
  width: 48px;
  height: 48px;
}
.file-name-delete {
  font-weight: 600;
  margin: 8px 0;
  word-break: break-all;
}
.hint-delete {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}
.modal-actions-delete {
  display: flex;
  justify-content: center;
  gap: 12px;
}
button.secondary-delete {
  background: #555;
}
button.danger-delete {
  background: var(--danger);
}

/* Стили для полноэкранной модалки */
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
.modal-full {
  background: var(--surface);
  border-radius: 16px;
  width: calc(100% - 48px);
  height: calc(100% - 48px);
  max-width: 1000px;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.modal-header h2 {
  margin: 0;
  font-size: 20px;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 28px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0 8px;
}
.receipt-form {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.input-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.input-row input {
  flex: 1;
  padding: 10px 14px;
  font-size: 16px;
}
.input-row button {
  padding: 10px 20px;
  font-size: 16px;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 20px;
}
th,
td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  font-size: 15px;
}
td input {
  width: 100%;
  padding: 6px 10px;
  font-size: 15px;
}
.submit-row {
  text-align: right;
  margin-top: 16px;
}
.submit-row button {
  padding: 12px 24px;
  font-size: 16px;
}
.result {
  background: var(--bg);
  padding: 16px;
  border-radius: var(--radius);
  margin-top: 20px;
  font-size: 15px;
}
.error {
  color: var(--danger);
}

/* Адаптация для мобильных */
/* --- Мобильная адаптация приёмки --- */
@media (max-width: 768px) {
  .modal-full {
    width: 100%;
    height: 100%;
    border-radius: 0;
    max-width: 100%;
    max-height: 100%;
  }

  .receipt-form {
    padding: 16px;
  }

  .input-row {
    flex-direction: column;
    gap: 10px;
  }

  .input-row input {
    width: 100%;
    padding: 12px 14px;
    font-size: 16px;
  }

  .input-row button {
    width: 100%;
    padding: 12px;
    font-size: 16px;
  }

  /* Скрываем таблицу, показываем карточки */
  table {
    display: none;
  }

  .receipt-cards {
    display: grid;
    gap: 12px;
    margin-bottom: 20px;
  }

  .receipt-card {
    background: var(--bg);
    border-radius: var(--radius);
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .receipt-card-main {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .receipt-card-sku {
    font-weight: 600;
    font-size: 16px;
    word-break: break-word;
    flex: 1 0 auto;
    min-width: 0;
  }

  .receipt-card-qty {
    font-size: 16px;
    color: var(--primary);
    font-weight: 600;
    white-space: nowrap;
  }

  .receipt-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  .receipt-card-meta input {
    width: calc(50% - 3px);
    padding: 8px 10px;
    font-size: 15px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
  }

  .receipt-card-remove {
    text-align: right;
  }

  .receipt-card-remove button {
    background: transparent;
    color: var(--danger);
    padding: 8px 12px;
    font-size: 15px;
    border: 1px solid var(--danger);
    border-radius: var(--radius);
  }

  .submit-row button {
    width: 100%;
    padding: 14px;
    font-size: 16px;
  }
}
</style>
