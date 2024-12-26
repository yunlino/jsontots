import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import TinyVue from '@opentiny/vue';

const app = createApp(App);

app.use(TinyVue);

app.mount('#app');
