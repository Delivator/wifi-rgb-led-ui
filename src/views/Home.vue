<template>
  <v-container fluid>
    <v-dialog v-model="modal" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Add device</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="name" label="Name" required></v-text-field>
          <v-text-field v-model="ip" label="IP" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" outlined @click="modal = false">Cancle</v-btn>
          <v-btn color="success" @click="addDevice">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row align="center" justify="center">
      <v-col cols="12">
        <h1 class="display-3 text-center">WiFi RGB LED Web UI</h1>
      </v-col>
      <v-col cols="12">
        <template v-if="currentUser">
          <p class="headline text-center">Welcome back!</p>
          <v-row justify="center">
            <v-col cols="6" class="text-center">
              <v-divider class="divider-margin"></v-divider>
              <v-btn color="success" @click="modal = !modal" class="margin-bottom">Add device</v-btn>
            </v-col>
          </v-row>
          <template v-if="devices.length > 0">
            <v-row align="center" justify="center">
              <v-col v-for="device in devices" :key="device.id" cols="12" xl="2" lg="4" md="8" sm="12">
                <v-card >
                  <v-toolbar color="primary">
                    <v-toolbar-title>{{ device.data().name }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text icon>
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <v-card-text>
                    <v-container fluid>
                      <v-row>
                        <v-col cols="12">
                          <v-btn class="margin-right" :outlined="device.status.on" color="success" @click="onDevice(device)">ON</v-btn>
                          <v-btn color="error" :outlined="!device.status.on" @click="offDevice(device)">OFF</v-btn>
                        </v-col>
                        <v-col cols="12">
                          <div class="colorPicker margin-bottom" :id="device.id"> {{ generateColor() }}</div>
                          <p class="title">Animations:</p>
                          <v-slider thumb-label v-model="device.status.speed" @input="device.webSocket.send('d' + device.status.speed)" step="1" value="32" min="0" max="500"></v-slider>
                          <v-btn class="margin-right margin-bottom" color="primary" :outlined="device.status.animation == 1" @click="setAnimation(device, 1)">Still</v-btn>
                          <v-btn class="margin-right margin-bottom" color="primary" :outlined="device.status.animation == 2" @click="setAnimation(device, 2)">Fading</v-btn>
                          <v-btn class="margin-right margin-bottom" color="primary" :outlined="device.status.animation == 3" @click="setAnimation(device, 3)">Blink</v-btn>
                          <v-btn class="margin-right margin-bottom" color="primary" :outlined="device.status.animation == 4" @click="setAnimation(device, 4)">Breathing</v-btn>
                          <v-btn class="margin-right margin-bottom" color="primary" :outlined="device.status.animation == 5" @click="setAnimation(device, 5)">Fire</v-btn>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </template>
        <template v-else>
          <div class="text-center">
            <p>Start by <v-btn to="/login">Login</v-btn> in or <v-btn to="/register">Create a Account</v-btn></p>
          </div>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as fb from "../plugins/firebaseHelper"
import iro from "@jaames/iro"

export default {
  props: ["alertBox"],
  data: () => ({
    currentUser: fb.currentUser,
    devices: [],
    modal: false,
    name: "",
    ip: ""
  }),

  methods: {
    generateColor() {
      this.devices.forEach(device => {
        if (!device.exists) return
        setTimeout(() => {
          if (!device.colorPicker) {
            device.colorPicker = new iro.ColorPicker("#" + device.id, {
              color: device.status ? device.status.rgb : "#f00"
            })
            device.colorPicker.on("color:change", (color) => {
              device.preventEvent = false
              if (!device.preventEvent) this.sendColors(device, color.hexString)
            })
            device.colorPicker.on("input:end", () => {
              device.webSocket.send("g")
            })
          }
        }, 1000)
      })
    },
    addDevice() {
      fb.devices
        .add({
          creator: this.currentUser.uid,
          name: this.name,
          ip: this.ip
        })
        .then(() => {
          this.modal = false
        })
        .catch(e => {
          this.alertBox.send("error", e, 10000)
        })
    },
    sendColors(device, color) {
      if (device.webSocket) device.webSocket.send(color)
    },
    onDevice(device) {
      if (device.webSocket) {
        device.webSocket.send("a1")
        device.colorPicker.color.hsl.l = 50
        this.sendColors(device, device.colorPicker.color.hexString)
        device.webSocket.send("g")
      }
    },
    offDevice(device) {
      if (device.webSocket) {
        device.webSocket.send("0")
        device.webSocket.send("g")
      }
    },
    setAnimation(device, animation) {
      if (device.webSocket) {
        device.webSocket.send("a" + animation)
        device.webSocket.send("g")
      }
    }
  },

  mounted() {
    fb.devices
      .where("creator", "==", this.currentUser.uid)
      .get()
      .then(querySnapshot => {
        if (!querySnapshot.empty) {
          this.devices = querySnapshot.docs
        }
        this.devices.forEach(device => {
          if (!device.exists) return
          let data = device.data()

          device.preventEvent = false;

          device.status = {
            rgb: {
              r: 255,
              g: 255,
              b: 255,
            },
            animation: 0,
            speed: 32,
            on: false
          }

          if (!device.webSocket) device.webSocket = new WebSocket("ws://" + data.ip + ":81")
          device.webSocket.onmessage = (e) => {
            let data = e.data.split(",")
            data = data.map(x => parseInt(x))
            device.status = {
              rgb: {
                r: data[0],
                g: data[1],
                b: data[2]
              },
              animation: data[3],
              speed: data[4],
              on: !!data[3]
            }
            device.preventEvent = true
            if (device.colorPicker) device.colorPicker.rgb = device.status.rgb
            this.$forceUpdate()
          }
          device.webSocket.onopen = () => {
            device.webSocket.send("g")
          }
        })
      })
      .catch(e => {
        this.alertBox.send("error", e, 10000)
      })
  }
}
</script>
