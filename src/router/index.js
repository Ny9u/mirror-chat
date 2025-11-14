import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Chat",
    component: () => import("../pages/chat/index.vue"),
  },
  {
    path: "/auth",
    name: "Auth",
    component: () => import("../pages/auth/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
