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

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if ((!configStore.userId && isLoggedIn) || to.meta.forceRefresh) {
      // 非阻塞式验证：先放行路由，后台验证
      validate().then((res) => {
        if (res.code === 200 && res.data) {
          configStore.setUserId(res.data.id);
          configStore.setName(res.data.username);
          configStore.setAvatar(res.data.avatar);
          localStorage.setItem("isLoggedIn", "true");
        } else {
          localStorage.removeItem("isLoggedIn");
          // 如果是需要认证的页面，则跳转进行认证
          if (to.name !== "Chat" && to.name !== "Home") {
            window.location.href = "/auth";
          }
        }
      }).catch(() => {
        localStorage.removeItem("isLoggedIn");
        if (to.name !== "Chat" && to.name !== "Home") {
          window.location.href = "/auth";
        }
      });
    } else if (!configStore.userId && !isLoggedIn && to.name !== "Chat" && to.name !== "Home") {
      // 如果既没有userId也没有登录标记，直接跳转登录页
      window.location.href = "/auth";
    }
  }
  next();
});

export default router;
