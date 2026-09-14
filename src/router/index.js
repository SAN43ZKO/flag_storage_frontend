import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import WarehousePage from "../pages/StoragePage.vue";
import DocumentsPage from "../pages/DocumentsPage.vue";
import HistoryPage from "../pages/HistoryPage.vue";

const routes = [
  { path: "/", component: HomePage, meta: { title: "Главная" } },
  { path: "/warehouse", component: WarehousePage, meta: { title: "Склад" } },
  { path: "/documents", component: DocumentsPage, meta: { title: "Документы" } },
  { path: "/history", component: HistoryPage, meta: { title: "История" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Реальное название вкладки (теги <title> внутри SFC не работают)
router.afterEach((to) => {
  document.title = to.meta?.title
    ? `Группа Флаг | ${to.meta.title}`
    : "Группа Флаг";
});

export default router;
