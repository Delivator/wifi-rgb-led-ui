<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <router-link to="/">
        <div class="d-flex align-center">
          <v-img
            alt="Vuetify Logo"
            class="shrink mr-2"
            contain
            src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
            transition="scale-transition"
            width="40"
          />

          <v-img
            alt="Vuetify Name"
            class="shrink mt-1 hidden-sm-and-down"
            contain
            min-width="100"
            src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
            width="100"
          />
        </div>
      </router-link>

      <v-spacer></v-spacer>

      <template v-if="currentUser">
        <v-btn @click="signOut">Logout</v-btn>
      </template>
      <template v-else>
        <v-btn to="/login">Login</v-btn>
      </template>

      <!-- <v-btn
        href="https://github.com/Delivator/wifi-rgb-led-ui"
        target="_blank"
        text
      >
        <span class="mr-2">GitHub</span>
        <v-icon>open_in_new</v-icon>
      </v-btn> -->
    </v-app-bar>

    <v-content>
      <div class="alert">
        <v-alert
          v-for="alert in alerts"
          :key="alert.id"
          v-model="alert.show"
          :type="alert.type"
          dismissible
          transition="slide-y-transition"
          >{{ alert.text }}</v-alert
        >
      </div>
      <router-view :alertBox="alertBox"/>
    </v-content>
  </v-app>
</template>

<style>
@import "../public/css/style.css";
</style>


<script>
import * as fb from "./plugins/firebaseHelper"

export default {
  name: "app",
  data: function() {
    return {
      currentUser: fb.currentUser,
      alerts: [],
      alertBox: {
        show: false,
        type: "info",
        text: "",
        send: (type, message, timeout) => {
          if (!timeout || isNaN(timeout) || timeout < 1) timeout = 7500;
          if (!message || message === "") message = "Unknown error";
          if (!type || !/success|info|warning|error/.test(type)) type = "info";
          if (type === "error") {
            if (message instanceof Error) {
              console.error(message);
              message = message.message;
            }
          }

          let id = Math.random().toString();

          this.alerts.push({
            id,
            show: true,
            type,
            text: message,
            timeout: setTimeout(() => {
              this.alerts.filter(alert => alert.id === id)[0].show = false;
            }, timeout)
          });
        }
      },
    }
  },

  methods: {
    signOut: function() {
      fb.auth
        .signOut()
        .then(() => {
          this.alertBox.send("info", "Logged out", 3000);
        })
        .catch(e => {
          this.alertBox.send("error", e, 10000);
        })
    }
  },

  mounted: function() {
    fb.auth.onAuthStateChanged(user => {
      this.currentUser = user;
      this.$root.$emit("onAuthStateChanged", user);
    });
  }
};
</script>
