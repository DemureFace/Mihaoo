import './assets/global.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store';

const app = createApp(App)

app.use(router)
app.use(store);

if (new URLSearchParams(location.search).get('reset') === '1') {
  localStorage.removeItem('cl:defs')
  localStorage.removeItem('cl:defs:ver')
}
app.mount('#app')
