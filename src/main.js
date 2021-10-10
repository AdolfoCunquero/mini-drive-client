import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueSession from 'vue-session'
import vuetify from '@/plugins/vuetify' 
import axios from 'axios'

Vue.config.productionTip = false

axios.defaults.baseURL = "http://localhost:3500/"
axios.defaults.headers = {
  "Authorization":"BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTVkNDRkYzJkMjY5NTQyNjU1OWMyYjUiLCJiaXJ0aERhdGUiOiIxOTk5LTAxLTEyVDAwOjAwOjAwWiIsImVtYWlsIjoiYWRvbGZvQGdtYWlsLmNvbSIsImV4cCI6MTYzMzkwNjE4MCwiZmlyc3ROYW1lIjoiQWRvbGZvIiwibGFzdE5hbWUiOiJDdW5xdWVybyJ9.mZp-Av0y9fvbebbqwj5vSZfZH8ntesqt1Ti50xldqFY"
}

var options = {
  persist: true
}

Vue.use(VueSession, options)

new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
