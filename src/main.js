import { createApp } from "vue";
import App from "./App.vue";
import "./styles/index.less";
import "./styles/markdown.less";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import api from "./config/api";
import router from "./router";

// anime.js 延迟加载
window.loadAnimeJS = () => {
  return new Promise((resolve, reject) => {
    if (window.anime) {
      resolve(window.anime);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.bootcdn.net/ajax/libs/animejs/3.2.2/anime.min.js";
    script.async = true;
    script.onload = () => resolve(window.anime);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);
app.use(router);
app.config.globalProperties.$api = api;
app.mount("#app");
