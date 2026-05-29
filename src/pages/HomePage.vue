<template>
  <title>Группа Флаг | Главная</title>
  <div class="home">
    <!-- Сводка -->
    <section class="stats">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total_products ?? "—" }}</div>
        <div class="stat-label">Товаров</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.total_categories ?? "—" }}</div>
        <div class="stat-label">Категорий</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ stats.low_stock_count ?? "—" }}</div>
        <div class="stat-label">Мало на складе</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ docCount ?? "—" }}</div>
        <div class="stat-label">Документов</div>
      </div>
    </section>

    <!-- Быстрые действия -->
    <section class="quick-actions">
      <router-link to="/warehouse" class="action-btn">📦 Склад</router-link>
      <router-link to="/documents" class="action-btn">📄 Документы</router-link>
    </section>

    <!-- Таблицы (скрыты при showTables = false) -->
    <!-- Табы и слайдер видны всегда -->
    <section class="tables-header">
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'low' }"
          @click="activeTab = 'low'"
        >
          Товары на исходе
        </button>
        <button
          :class="{ active: activeTab === 'recent' }"
          @click="activeTab = 'recent'"
        >
          Недавно изменённые
        </button>
      </div>
      <div class="tables-toggle">
        <label class="switch">
          <input type="checkbox" v-model="showTables" />
          <span class="slider"></span>
        </label>
        <span class="switch-label"
          >{{ showTables ? "Скрыть" : "Показать" }} таблицы</span
        >
      </div>
    </section>

    <!-- Содержимое таблиц скрывается/показывается -->
    <section v-show="showTables" class="tables">
      <!-- Таблица "Товары на исходе" -->
      <div v-show="activeTab === 'low'">
        <div v-if="loadingLowStock" class="loading">Загрузка...</div>
        <table v-else-if="lowStock.length">
          <thead>
            <tr>
              <th>Название</th>
              <th>Артикул</th>
              <th>Остаток</th>
              <th>Обновлён</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in lowStock"
              :key="p.id"
              @click="goToEdit(p.id)"
              class="clickable"
            >
              <td>{{ p.name || "—" }}</td>
              <td>{{ p.sku || "—" }}</td>
              <td class="low">{{ p.quantity }}</td>
              <td>{{ new Date(p.updated_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>Все товары в достатке 🎉</p>
      </div>

      <!-- Таблица "Недавно изменённые" -->
      <div v-show="activeTab === 'recent'">
        <div v-if="loadingRecent" class="loading">Загрузка...</div>
        <table v-else-if="recentProducts.length">
          <thead>
            <tr>
              <th>Название</th>
              <th>Артикул</th>
              <th>Остаток</th>
              <th>Обновлён</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in recentProducts"
              :key="p.id"
              @click="goToEdit(p.id)"
              class="clickable"
            >
              <td>{{ p.name || "—" }}</td>
              <td>{{ p.sku || "—" }}</td>
              <td :class="{ low: p.quantity < 10 }">{{ p.quantity }}</td>
              <td>{{ new Date(p.updated_at).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>Нет изменённых товаров</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api as productApi } from "../api.js";
import { documentsApi } from "../api/documents.js";

const router = useRouter();

const stats = ref({
  total_products: 0,
  total_categories: 0,
  low_stock_count: 0,
});
const docCount = ref(0);
const lowStock = ref([]);
const recentProducts = ref([]);
const loadingLowStock = ref(true);
const loadingRecent = ref(true);
const activeTab = ref("low");
const showTables = ref(false); // по умолчанию таблицы скрыты

async function fetchStats() {
  try {
    const [prodResp, docs] = await Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      documentsApi.list(),
    ]);
    stats.value = prodResp;
    docCount.value = docs.length;
  } catch (e) {
    console.error("Stats fetch error", e);
  }
}

async function fetchLowStock() {
  loadingLowStock.value = true;
  try {
    const data = await fetch("/api/products/low-stock").then((r) => r.json());
    lowStock.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Low-stock fetch error", e);
    lowStock.value = [];
  } finally {
    loadingLowStock.value = false;
  }
}

async function fetchRecent() {
  loadingRecent.value = true;
  try {
    const all = await productApi.list();
    const sorted = [...all].sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
    );
    recentProducts.value = sorted.slice(0, 5);
  } catch (e) {
    console.error("Recent products error", e);
    recentProducts.value = [];
  } finally {
    loadingRecent.value = false;
  }
}

function goToEdit(id) {
  router.push({ path: "/warehouse", query: { edit: id } });
}

onMounted(() => {
  fetchStats();
  fetchLowStock();
  fetchRecent();
});
</script>

<style scoped>
.home {
  max-width: 960px;
  margin: 0 auto;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.stat-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
  transition: background var(--transition);
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}
.warning .stat-value {
  color: var(--danger);
}
.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}
.action-btn {
  flex: 1;
  display: block;
  text-align: center;
  padding: 16px;
  background: var(--surface);
  border-radius: var(--radius);
  color: var(--text);
  text-decoration: none;
  font-size: 16px;
  transition: background var(--transition);
}
.action-btn:hover {
  background: var(--primary);
  color: #fff;
}
/* Стили переключателя */
.tables-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border);
  transition: 0.3s;
  border-radius: 22px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text);
  transition: 0.3s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: var(--primary);
}
input:checked + .slider:before {
  transform: translateX(18px);
}
.switch-label {
  font-size: 13px;
  color: var(--text-secondary);
}
.tables {
  background: var(--surface);
  border-radius: 0 0 var(--radius) var(--radius);
  padding: 0 16px 16px;
  border-top: none;
}
.tabs button {
  background: transparent;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  border-radius: 0%;
  margin-bottom: -2px; /* чтобы перекрыть родительскую границу */
  transition:
    color var(--transition),
    border-color var(--transition);
}
.tabs button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.tabs button:hover:not(.active) {
  color: var(--text);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 10px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
th {
  font-size: 13px;
  color: var(--text-secondary);
}
td {
  font-size: 14px;
}
.low {
  color: var(--danger);
  font-weight: 600;
}
.clickable {
  cursor: pointer;
}
.clickable:hover {
  background: var(--border);
}
.loading {
  text-align: center;
  color: var(--text-secondary);
}
.tables-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 12px 16px 0;
  border-bottom: 2px solid var(--border);
}
</style>
