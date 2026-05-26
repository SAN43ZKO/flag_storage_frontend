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
            <td class="cell-name">
              <div class="name-with-avatar">
                <div
                  class="avatar"
                  :class="{ 'has-image': product.image_path }"
                  @click="product.image_path && $emit('preview', product.image_path)"
                >
                  <img
                    v-if="product.image_path"
                    :src="`/products/images/${product.image_path}`"
                    class="avatar-img"
                    alt=""
                  />
                  <span v-else class="avatar-placeholder">—</span>
                </div>
                <span class="product-name">{{ product.name ?? '—' }}</span>
              </div>
            </td>
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

defineEmits(['edit', 'delete', 'add', 'preview'])
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
  table-layout: fixed;
}
th, td {
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
.cell-name {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cell-actions {
  white-space: nowrap;
}
.actions {
  display: flex;
  gap: 6px;
}
.actions button {
  background: transparent;
  padding: 6px;
  color: var(--text-secondary);
  border-radius: 4px;
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
/* Стили аватара */
.name-with-avatar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar.has-image {
  cursor: pointer;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  font-size: 12px;
  color: var(--text-secondary);
}
.product-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
