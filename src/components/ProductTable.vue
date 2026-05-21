<template>
  <div class="table-container">
    <div class="table-content">
      <div v-if="loading" class="loading">Загрузка...</div>

      <div v-else-if="!products || products.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg class="icon" viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" fill="none">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p>На складе пока нет товаров</p>
        <button @click="$emit('add')">+ Добавить первый товар</button>
      </div>

      <table v-else>
        <colgroup>
          <col class="col-id" />
          <col class="col-name" />
          <col class="col-sku" />
          <col class="col-category" />
          <col class="col-unit" />
          <col class="col-qty" />
          <col class="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Артикул</th>
            <th>Категория</th>
            <th>Ед.</th>
            <th>Количество</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td class="cell-name">{{ product.name ?? '—' }}</td>
            <td>{{ product.sku ?? '—' }}</td>
            <td>{{ product.category ?? '—' }}</td>
            <td>{{ product.unit ?? '—' }}</td>
            <td>{{ product.quantity }}</td>
            <td class="cell-actions">
              <div class="actions">
                <button @click="$emit('edit', product)" title="Редактировать">
                  <svg class="icon" viewBox="0 0 24 24">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
                <button class="danger" @click="$emit('delete', product)" title="Удалить">
                  <svg class="icon" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  products: Array,
  loading: Boolean,
})

defineEmits(['edit', 'delete', 'add'])
</script>

<style scoped>
.table-container {
  background: var(--surface);
  border-radius: var(--radius);
  overflow: hidden;
  transition: background var(--transition);
}

.table-content {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.empty-state button {
  margin-top: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;  /* фиксированная ширина колонок, как у вас */
}

/* Ширины колонок */
.col-id { width: 60px; }
.col-name { width: auto; }      /* будет занимать оставшееся пространство */
.col-sku { width: 110px; }
.col-category { width: 110px; }
.col-unit { width: 60px; }
.col-qty { width: 90px; }
.col-actions { width: 100px; }

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;   /* содержимое выровнено по центру */
  /* убрали фиксированную высоту, строка растягивается по содержимому */
}

th {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 13px;
}

td {
  font-size: 14px;
  word-wrap: break-word;     /* длинные слова переносятся, чтобы не вылезать за границы */
  overflow-wrap: break-word;
}

/* Колонка названия – перенос текста разрешён */
.cell-name {
  /* никаких nowrap, overflow: hidden или text-overflow – показываем полностью */
}

/* Ячейка действий – обычная табличная ячейка */
.cell-actions {
  /* без дополнительных стилей */
}

/* Контейнер для кнопок */
.actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.actions button {
  background: transparent;
  border: none;
  padding: 4px;               /* компактные кнопки */
  color: var(--text-secondary);
  border-radius: 4px;
  line-height: 0;             /* убираем лишнее пространство вокруг иконки */
  transition: color var(--transition), background var(--transition);
}

.actions button:hover {
  background: var(--border);
  color: var(--text);
}

.actions button.danger:hover {
  color: var(--danger);
  background: rgba(239, 83, 80, 0.1);
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
