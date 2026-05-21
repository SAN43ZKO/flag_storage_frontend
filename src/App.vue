<template>
  <div class="app">
    <header>
      <div class="nav">
        <router-link to="/" class="nav-link">Главная</router-link>
        <router-link to="/warehouse" class="nav-link">Складской учёт</router-link>
        <router-link to="/documents" class="nav-link">Документы</router-link>
      </div>
      <button @click="toggleTheme" class="theme-btn" title="Сменить тему">
        <svg class="icon" viewBox="0 0 24 24">
          <path v-if="isDark" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          <circle v-else cx="12" cy="12" r="5" />
          <line v-if="!isDark" x1="12" y1="1" x2="12" y2="3" />
          <line v-if="!isDark" x1="12" y1="21" x2="12" y2="23" />
          <line v-if="!isDark" x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line v-if="!isDark" x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line v-if="!isDark" x1="1" y1="12" x2="3" y2="12" />
          <line v-if="!isDark" x1="21" y1="12" x2="23" y2="12" />
          <line v-if="!isDark" x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line v-if="!isDark" x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        {{ isDark ? 'Тёмная' : 'Светлая' }}
      </button>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isDark = ref(true)

function applyTheme() {
  if (isDark.value) {
    document.body.classList.remove('light-theme')
  } else {
    document.body.classList.add('light-theme')
  }
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  applyTheme()
}

const saved = localStorage.getItem('theme')
if (saved === 'light') {
  isDark.value = false
}
applyTheme()
</script>

<style scoped>
.app {
  max-width: 960px;
  margin: 0 auto;
  min-height: 100vh;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 15px;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: color var(--transition), border-color var(--transition);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text);
  border-bottom-color: var(--primary);
}

.theme-btn {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 6px 12px;
  font-size: 13px;
}

.theme-btn:hover {
  background: var(--border);
}
</style>
