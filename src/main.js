import { createApp } from 'vue'
import App from './App.vue'
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp(App)

app.use(vue3GoogleLogin, {
  clientId: '729581094163-ibuug8oaa9gb0hb2fde3b6mei5343v5e.apps.googleusercontent.com'
})

app.mount('#app')
