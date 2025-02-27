import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import BadugiDistribution from './components/BadugiDistribution.vue'

const app = createApp(App)
app.use(router)

// ルートコンポーネントを登録
app.component('BadugiDistribution', BadugiDistribution)

app.mount('#app') 
