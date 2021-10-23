import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueSession from 'vue-session'
import vuetify from '@/plugins/vuetify' 
import axios from 'axios'
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

Vue.config.productionTip = false
Vue.use(VueSweetalert2);

var options = {
  persist: true
}

Vue.use(VueSession, options)

axios.defaults.baseURL = "http://localhost:3500/"

// axios.defaults.headers = {
//   "Authorization":"Bearer"
// }


new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
