<template>
  <div>
    <div class="editor-header">
      <h1>Редактор документа</h1>
      <button @click="close">Закрыть</button>
    </div>
    <div v-if="loading" class="loading">Загрузка редактора...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <iframe
      v-else
      :src="editorUrl"
      style="width:100%; height:80vh; border:none;"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { documentsApi } from '../api/documents.js'

const route = useRoute()
const router = useRouter()

const id = route.params.id
const loading = ref(true)
const error = ref('')
const editorUrl = ref('')

onMounted(async () => {
  try {
    const config = await documentsApi.getEditorConfig(id)
    // OnlyOffice Editor URL: адрес Document Server + /web-apps/apps/api/documents/api.js
    // Но для iframe нужно открыть редактор с передачей конфигурации.
    // Обычно используют API: new DocsAPI.DocEditor('placeholder', config)
    // Чтобы не усложнять, можно вставить скрипт и вызвать. Проще сделать отдельный HTML,
    // который загрузит конфиг из URL параметра. Но для минимализма создадим прямо здесь:
    // Создадим URL, закодировав конфиг в base64 и передав как параметр.
    // Альтернатива: открыть в новой вкладке страницу, которая примет конфиг.
    // Используем подход: сгенерируем временную HTML-страницу с конфигом.
    const configStr = JSON.stringify(config)
    const encodedConfig = btoa(unescape(encodeURIComponent(configStr)))
    // Создаём URL на основе API OnlyOffice (документация: ...?config=...)
    // Обычно OnlyOffice Document Server предоставляет страницу /example/editor?config=...
    // Но для простоты мы просто откроем iframe с https://.../web-apps/apps/api/documents/api.js
    // Нет, правильный способ: использовать JavaScript API.
    // Создадим временный blob HTML.
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <script type="text/javascript" src="${import.meta.env.VITE_ONLYOFFICE_URL}/web-apps/apps/api/documents/api.js"></script>
    <style>html, body { margin:0; padding:0; height:100%; }</style>
</head>
<body>
    <div id="placeholder" style="height:100%"></div>
    <script>
        var config = JSON.parse(decodeURIComponent(escape(atob('${encodedConfig}'))));
        new DocsAPI.DocEditor('placeholder', config);
    </\script>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    editorUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function close() {
  router.back()
}
</script>

<style scoped>
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.loading, .error {
  padding: 20px;
  text-align: center;
}
</style>
