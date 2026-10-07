import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import './design-system/tokens.css';
import './styles.css';

// 生产构建时切换为 unplugin-vue-components 按需引入（见架构文档 §1.1）
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);
app.use(ElementPlus);
app.mount('#app');
