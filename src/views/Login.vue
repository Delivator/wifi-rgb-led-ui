<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit="login">
              <v-text-field
                :rules="[rules.required, rules.email]"
                label="Email"
                prepend-icon="email"
                type="text"
                ref="email"
                v-model="email"
              />

              <v-text-field
                :rules="[rules.required]"
                label="Password"
                prepend-icon="lock"
                type="password"
                ref="password"
                v-model="password"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="login" color="primary" type="submit">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as fb from "../plugins/firebaseHelper"

export default {
  props: ["alertBox"],
  data () {
    return {
      email: "",
      password: "",
      rules: {
        required: value => !!value || "Required.",
        counter: value => value.length <= 20 || "Max 20 characters",
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || "Invalid e-mail."
        },
      }
    }
  },
  methods: {
    login: function(event) {
      if (event) event.preventDefault();
      if (!this.$refs.email.valid || !this.$refs.password.valid) {
        this.$refs.email.validate(true);
        this.$refs.password.validate(true);
        return;
      }
      fb.auth
        .signInWithEmailAndPassword(this.email, this.password)
        .then(() => {
          this.loading = false;
          this.alertBox.send("success", "Logged in", 3000);
          this.$router.replace("/");
        })
        .catch(e => {
          this.loading = false;
          this.alertBox.send("error", e, 10000);
        });
    }
  }
}
</script>