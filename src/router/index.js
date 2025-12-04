import { createRouter, createWebHistory } from "vue-router";
import { useConfigStore } from "@/stores/configStore";
import { validate } from "@/services/user";

const routes = [
  {
    path: "/",
    name: "Chat",
    component: () => import("@/pages/chat/index.vue"),
  },
  {
    path: "/auth",
    name: "Auth",
    component: () => import("@/pages/auth/index.vue"),
  },
  {
    path: "/setting",
    name: "Setting",
    component: () => import("@/pages/setting/index.vue"),
  },
  {
    path: "/setting/profile",
    name: "Profile",
    component: () => import("@/pages/setting/components/profile.vue"),
  },
  {
    path: "/collection",
    name: "Collection",
    component: () => import("@/pages/chat/components/collection.vue"),
  },
  {
    path: "/collection/:id",
    name: "CollectionDetail",
    component: () => import("@/pages/chat/components/collectionDetail.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = [
    "Chat",
    "Setting",
    "Profile",
    "Collection",
    "CollectionDetail",
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
        if (to.name !== "Chat") {
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
