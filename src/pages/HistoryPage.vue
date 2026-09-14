<template>
  <div>
    <div class="page-header">
      <h1>История изменений</h1>
    </div>
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по товару..."
        @input="debouncedFetch"
      />
    </div>
    <div class="table-container">
      <div class="table-content">
        <div v-if="loading" class="loading">Загрузка...</div>

        <div v-else-if="!changes || changes.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg
              class="icon"
              viewBox="0 0 24 24"
              width="48"
              height="48"
              stroke="currentColor"
              fill="none"
            >
              <path d="M12 8v4l3 3M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
            </svg>
          </div>
          <p>Изменений пока нет</p>
        </div>

        <table v-else>
          <colgroup>
            <col class="col-date" />
            <col class="col-product" />
            <col class="col-field" />
            <col class="col-old" />
            <col class="col-new" />
          </colgroup>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Товар</th>
              <th>Поле</th>
              <th>Старое значение</th>
              <th>Новое значение</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="change in changes" :key="change.id">
              <td>{{ new Date(change.changed_at).toLocaleString() }}</td>
              <td>
                {{ productNames[change.product_id] || `#${change.product_id}` }}
              </td>
              <td>{{ fieldLabel(change.field) }}</td>
              <td>{{ change.old_value ?? "—" }}</td>
              <td>{{ change.new_value ?? "—" }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Мобильные карточки -->
      <div class="card-list">
        <div v-for="change in changes" :key="change.id" class="change-card">
          <div class="change-card-header">
            <div class="change-date">
              {{ new Date(change.changed_at).toLocaleString() }}
            </div>
            <div class="change-field">{{ fieldLabel(change.field) }}</div>
          </div>
          <div class="change-product">
            {{ productNames[change.product_id] || `#${change.product_id}` }}
          </div>
          <div class="change-values">
            <div><span>Старое:</span> {{ change.old_value ?? "—" }}</div>
            <div><span>Новое:</span> {{ change.new_value ?? "—" }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const changes = ref([]);
const loading = ref(true);
const productNames = ref({});
const searchQuery = ref("");

let debounceTimer;
// Обработчик для @input — сработает, когда в шаблоне вызван debouncedFetch
function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchChanges, 300);
}

async function fetchChanges() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (searchQuery.value.trim()) {
      params.set("q", searchQuery.value.trim());
    }
    const qs = params.toString();
    const resp = await fetch(`/product-changes${qs ? "?" + qs : ""}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    changes.value = Array.isArray(data) ? data : [];

    // Подгружаем список товаров для отображения названий
    const productsResp = await fetch("/products");
    if (!productsResp.ok) throw new Error(`HTTP ${productsResp.status}`);
    const products = await productsResp.json();
    if (Array.isArray(products)) {
      const map = {};
      products.forEach((p) => {
        map[p.id] = p.name || p.sku || `#${p.id}`;
      });
      productNames.value = map;
    }
  } catch (e) {
    console.error("Ошибка загрузки истории", e);
    changes.value = [];
  } finally {
    loading.value = false;
  }
}

function fieldLabel(field) {
  const labels = {
    name: "Название",
    sku: "Артикул",
    quantity: "Количество",
    category: "Категория",
    unit: "Ед. изм.",
    image_path: "Изображение",
    reserved: "Резерв",
    created: "Создание",
    deleted: "Удаление",
  };
  return labels[field] || field;
}

onMounted(fetchChanges);
</script>

<style scoped>
.col-date {
  width: 15%;
}
.col-product {
  width: 25%;
}
.col-field {
  width: 12%;
}
.col-old {
  width: 22%;
}
.col-new {
  width: 26%;
}

.table-container {
  background: var(--surface);
  border-radius: var(--radius);
  overflow: hidden;
  transition: background var(--transition);
}
.table-content {
  min-height: 200px;
  display: block;
}
.loading {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 20px;
  color: var(--text-secondary);
}
.empty-icon {
  opacity: 0.6;
}
.empty-state p {
  font-size: 16px;
  margin: 0;
}
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
th,
td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
th {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 13px;
}
td {
  font-size: 14px;
}
.card-list {
  display: none;
}

/* Адаптация для мобильных */
@media (max-width: 768px) {
  .table-content {
    display: none;
  }
  .card-list {
    display: grid;
    gap: 12px;
    padding: 12px;
  }
  .change-card {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 12px;
  }
  .change-card-header {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }
  .change-field {
    font-weight: 600;
    color: var(--text);
  }
  .change-product {
    font-weight: 500;
    margin-bottom: 8px;
  }
  .change-values {
    font-size: 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .change-values span {
    color: var(--text-secondary);
  }
}
</style>
