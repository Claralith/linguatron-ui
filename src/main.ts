import { createApp } from "vue";
//import "./style.css";
import App from "./App.vue";
import router from "./router.ts";
import "./assets/tailwind.css";
import "./assets/style.css";

createApp(App).use(router).mount("#app");
