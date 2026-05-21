import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import WarehousePage from "../pages/StoragePage.vue";
import DocumentsPage from "../pages/DocumentsPage.vue";
import { compile } from "vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/warehouse", component: WarehousePage },
  { path: '/documents', component: DocumentsPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
