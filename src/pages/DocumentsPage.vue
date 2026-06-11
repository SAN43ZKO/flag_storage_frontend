<template>
  <title>Группа Флаг | Документы</title>
  <div>
    <div class="page-header">
      <h1>Документы</h1>
      <button @click="openUploadModal">+ Загрузить файл</button>
    </div>
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по имени файла"
      />
    </div>

    <div class="table-container">
      <div class="table-content">
        <div v-if="loading" class="loading">Загрузка...</div>

        <div v-else-if="!files || files.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg class="icon" viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <p>Нет загруженных документов</p>
          <button @click="openUploadModal">+ Загрузить первый документ</button>
        </div>

        <table v-else>
          <colgroup>
            <col class="col-id" />
            <col class="col-name" />
            <col class="col-size" />
            <col class="col-updated" />
            <col class="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя файла</th>
              <th>Размер</th>
              <th>Изменён</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in files" :key="file.id">
              <td>{{ file.id }}</td>
              <td class="cell-name">{{ file.filename }}</td>
              <td>{{ (file.size / 1024).toFixed(1) }} КБ</td>
              <td>{{ new Date(file.updated_at).toLocaleString() }}</td>
              <td class="cell-actions">
                <div class="actions">
                  <button @click="downloadFile(file)" title="Скачать">
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  <button
                    @click="previewFile(file)"
                    :disabled="previewLoading[file.id]"
                    :title="previewLoading[file.id] ? 'Идёт подготовка...' : 'Предпросмотр'"
                  >
                    <svg v-if="previewLoading[file.id]" class="icon spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round" />
                    </svg>
                    <svg v-else class="icon" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button @click="editFile(file)" title="Редактировать">
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </button>
                  <button class="danger" @click="deleteFile(file)" title="Удалить">
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

    <!-- Модальное окно загрузки -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal modal-square">
        <h2>Загрузить документы</h2>
        <form @submit.prevent="handleUpload">
          <label
            class="file-drop-area"
            :class="{ dragover: dragOver }"
            @dragover.prevent="onDragOver"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop"
          >
            <input
              type="file"
              ref="fileInput"
              accept=".doc,.docx"
              @change="onFileSelected"
              hidden
              multiple
            />
            <div v-if="selectedFiles.length === 0" class="drop-content">
              <svg class="icon icon-large" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>Перетащите файлы сюда или выберите</p>
            </div>
            <div v-else class="file-list">
              <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                <span>{{ file.name }}</span>
                <button type="button" @click.stop="removeFile(index)" class="clear-file">&times;</button>
              </div>
            </div>
          </label>
          <p v-if="selectedFiles.length > 0" class="file-count">
            Выбрано файлов: {{ selectedFiles.length }}
          </p>
          <div v-if="uploadProgress.total > 0" class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress.percent + '%' }"></div>
            <span class="progress-text">{{ uploadProgress.current }} / {{ uploadProgress.total }}</span>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeUploadModal" class="secondary" :disabled="uploading">Отмена</button>
            <button type="submit" :disabled="selectedFiles.length === 0 || uploading">Загрузить</button>
          </div>
        </form>
        <p v-if="uploadError" class="error">{{ uploadError }}</p>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
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
        <h2>Удалить документ?</h2>
        <p class="file-name">{{ deleteTarget?.filename }}</p>
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
import { ref, onMounted, watch } from "vue";
import { documentsApi } from "../api/documents.js";

const files = ref([]);
const loading = ref(true);
const showUploadModal = ref(false);
const fileInput = ref(null);
const selectedFiles = ref([]);
const dragOver = ref(false);
const uploading = ref(false);
const uploadProgress = ref({ current: 0, total: 0, percent: 0 });
const uploadError = ref('');
const previewLoading = ref({});
const showDeleteModal = ref(false);
const deleteTarget = ref(null);
const searchQuery = ref("");

// открыть модалку загрузки
function openUploadModal() {
  showUploadModal.value = true;
  uploadError.value = '';
  selectedFiles.value = [];
  uploadProgress.value = { current: 0, total: 0, percent: 0 };
  uploading.value = false;
}

function editFile(file) {
  const wopiSrc = encodeURIComponent(`http://frontend/wopi/files/${file.id}`);
  const editorUrl = `https://sklad.office:9980/browser/dist/cool.html?WOPISrc=${wopiSrc}&lang=ru`;
  window.open(editorUrl, "_blank");
}

let debounceTimer;
watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchFiles(newVal);
  }, 300);
});

async function fetchFiles(search = "") {
  loading.value = true;
  try {
    const data = await documentsApi.list(search);
    files.value = Array.isArray(data) ? data : [];
  } catch (e) {
    alert("Ошибка загрузки списка: " + e.message);
    files.value = [];
  } finally {
    loading.value = false;
  }
}

async function downloadFile(file) {
  try {
    const blob = await documentsApi.download(file.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Ошибка скачивания: " + e.message);
  }
}

async function previewFile(file) {
  if (previewLoading.value[file.id]) return;
  previewLoading.value[file.id] = true;
  try {
    const blob = await documentsApi.preview(file.id);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (e) {
    alert("Ошибка предпросмотра: " + e.message);
  } finally {
    previewLoading.value[file.id] = false;
  }
}

function deleteFile(file) {
  deleteTarget.value = file;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  deleteTarget.value = null;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  try {
    await documentsApi.delete(deleteTarget.value.id);
    await fetchFiles(searchQuery.value);
  } catch (e) {
    alert("Ошибка удаления: " + e.message);
  } finally {
    closeDeleteModal();
  }
}

function onFileSelected(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    addFiles(files);
    event.target.value = '';
  }
}

function onDragOver(e) {
  dragOver.value = true;
}

function onDragLeave() {
  dragOver.value = false;
}

function onDrop(e) {
  dragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    addFiles(files);
  }
}

function addFiles(fileList) {
  for (const file of fileList) {
    if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      if (!selectedFiles.value.some(f => f.name === file.name)) {
        selectedFiles.value.push({ name: file.name, file });
      }
    }
  }
  if (selectedFiles.value.length === 0 && fileList.length > 0) {
    uploadError.value = 'Поддерживаются только .doc и .docx';
  } else {
    uploadError.value = '';
  }
}

function removeFile(index) {
  selectedFiles.value.splice(index, 1);
  uploadError.value = '';
}

function clearSelectedFiles() {
  selectedFiles.value = [];
  uploadError.value = '';
  if (fileInput.value) fileInput.value.value = '';
}

function closeUploadModal() {
  showUploadModal.value = false;
  clearSelectedFiles();
  uploading.value = false;
  uploadProgress.value = { current: 0, total: 0, percent: 0 };
}

async function handleUpload() {
  if (selectedFiles.value.length === 0) return;
  uploading.value = true;
  uploadError.value = '';
  const total = selectedFiles.value.length;
  uploadProgress.value = { current: 0, total, percent: 0 };

  let successCount = 0;
  for (let i = 0; i < selectedFiles.value.length; i++) {
    const item = selectedFiles.value[i];
    const formData = new FormData();
    formData.append('file', item.file);

    try {
      await documentsApi.upload(formData);
      successCount++;
    } catch (e) {
      uploadError.value = `Ошибка при загрузке "${item.name}": ${e.message}`;
    }
    uploadProgress.value = {
      current: i + 1,
      total,
      percent: Math.round(((i + 1) / total) * 100)
    };
  }

  await fetchFiles(searchQuery.value);
  if (successCount === total) {
    closeUploadModal();
  } else {
    uploading.value = false;
    selectedFiles.value = selectedFiles.value.filter((_, idx) => idx >= successCount);
  }
}

onMounted(() => fetchFiles());
</script>

<style scoped>
/* --- layout --- */
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

/* --- table container --- */
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

/* --- table --- */
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

/* column widths */
col.col-id {
  width: 50px;
}
col.col-size {
  width: 100px;
}
col.col-name {
  width: 30%;
}
col.col-updated {
  width: 160px;
}
col.col-actions {
  width: 130px;
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
  transition:
    color var(--transition),
    background var(--transition);
}
.actions button:hover {
  background: var(--border);
  color: var(--text);
}
.actions button.danger:hover {
  color: var(--danger);
  background: rgba(239, 83, 80, 0.1);
}

/* --- modals --- */
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
.modal-square h2 {
  margin-bottom: 24px;
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

/* upload drop area */
.file-drop-area {
  display: block;
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  cursor: pointer;
  transition:
    border-color var(--transition),
    background var(--transition);
}
.file-drop-area:hover,
.file-drop-area.dragover {
  border-color: var(--primary);
  background: rgba(79, 195, 247, 0.05);
}
.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
}
.file-selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.clear-file {
  background: transparent;
  color: var(--text-secondary);
  padding: 2px 8px;
  font-size: 18px;
}
.clear-file:hover {
  color: var(--danger);
}

/* Список выбранных файлов */
.file-list {
  max-height: 150px;
  overflow-y: auto;
  text-align: left;
  width: 100%;
}
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
.file-item:last-child {
  border-bottom: none;
}
.file-count {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

/* Прогресс-бар */
.progress-bar {
  height: 20px;
  background: var(--border);
  border-radius: 10px;
  margin: 8px 0 16px;
  position: relative;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
  border-radius: 10px;
}
.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: var(--text);
  white-space: nowrap;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
button.secondary {
  background: #555;
}
.error {
  color: var(--danger);
  margin-top: 8px;
}

.icon {
  width: 16px;
  height: 16px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
