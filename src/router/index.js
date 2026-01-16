import { createRouter, createWebHistory } from "vue-router";
import { useConfigStore } from "@/stores/configStore";
import { validate } from "@/services/user";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/chat/index.vue"),
  },
  {
    path: "/chat/:id?",
    name: "Chat",
    component: () => import("@/views/chat/index.vue"),
  },
  {
    path: "/chat/history",
    name: "ChatHistory",
    component: () => import("@/views/chat/components/history.vue"),
  },
  {
    path: "/auth",
    name: "Auth",
    component: () => import("@/views/auth/index.vue"),
  },
  {
    path: "/setting",
    name: "Setting",
    component: () => import("@/views/setting/index.vue"),
  },
  {
    path: "/setting/profile",
    name: "Profile",
    component: () => import("@/views/setting/components/profile.vue"),
  },
  {
    path: "/collection",
    name: "Collection",
    component: () => import("@/views/collection/index.vue"),
  },
  {
    path: "/collection/:id",
    name: "CollectionDetail",
    component: () =>
      import("@/views/collection/components/collectionDetail.vue"),
  },
  {
    path: "/knowledge",
    name: "Knowledge",
    component: () => import("@/views/knowledge/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = [
    "Chat",
    "ChatHistory",
    "Setting",
    "Profile",
    "Collection",
    "Knowledge",
  ];

  if (requiresAuth.includes(to.name)) {
    const configStore = useConfigStore();

    if (!configStore.userId) {
      try {
        // 调用验证接口，Token 会通过 Cookie 自动发送
        const res = await validate();

        if (res.code === 200 && res.data) {
          // 保存用户信息到 store
          configStore.setUserId(res.data.id);
          configStore.setName(res.data.username);
          configStore.setAvatar(res.data.avatar);

          // 设置登录状态标记（用于前端判断）
          localStorage.setItem("isLoggedIn", "true");
          next();
        } else {
          // 验证失败，跳转到登录页
          localStorage.removeItem("isLoggedIn");
          next("/auth");
        }
      } catch (error) {
        // 验证接口调用失败（可能是未登录或 Token 过期）
        localStorage.removeItem("isLoggedIn");

        // Chat 和 Home 页面允许未登录访问
        if (to.name !== "Chat" && to.name !== "Home") {
          next("/auth");
        } else {
          next();
        }
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
