import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import { authStore } from './store/auth'

const app = createApp(App)
app.use(router)

authStore.checkAuth()
app.mount('#app')
