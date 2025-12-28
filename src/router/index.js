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
  {
    path: "/knowledge/:id",
    name: "KnowledgeDetail",
    component: () => import("@/views/knowledge/components/knowledgeDetail.vue"),
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
    "KnowledgeDetail",
  ];

  if (requiresAuth.includes(to.name)) {
    const configStore = useConfigStore();

    if (!configStore.userId) {
      const token = localStorage.getItem("jwtToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token && refreshToken) {
        try {
          const res = await validate();

          if (res.code === 200 && res.data) {
            configStore.setUserId(res.data.id);
            configStore.setName(res.data.username);
            configStore.setAvatar(res.data.avatar);

            if (res.data.token) {
              localStorage.setItem("jwtToken", res.data.token);
            }
            next();
          } else {
            next("/auth");
          }
        } catch (error) {
          next("/auth");
        }
      } else {
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
