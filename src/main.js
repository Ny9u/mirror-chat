import { createApp } from "vue";
import App from "./App.vue";
import "./styles/index.less";
import { createPinia } from "pinia";
import api from "./config/api";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.config.globalProperties.$api = api;
app.mount("#app");
