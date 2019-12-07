import Vue from "vue"
import App from "./App.vue"
import "./registerServiceWorker"
import router from "./router"
import vuetify from "./plugins/vuetify"
import "roboto-fontface/css/roboto/roboto-fontface.css"
import "material-design-icons-iconfont/dist/material-design-icons.css"
import * as fb from "./plugins/firebaseHelper"

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
    ? to.meta.title + " - WiFi RGB LED"
    : "WiFi RGB LED";
  next();
});

fb.auth.onAuthStateChanged(() => {
  new Vue({
    router,
    vuetify,
    render: h => h(App)
  }).$mount("#app")
})