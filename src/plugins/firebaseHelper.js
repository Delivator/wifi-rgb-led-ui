import * as firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"
import firebaseConfig from "../../firebaseConfig"

firebase.initializeApp(firebaseConfig.firebaseConfig)

const db = firebase.firestore();
const auth = firebase.auth();
let currentUser = auth.currentUser;

const devices = db.collection("devices");

auth.onAuthStateChanged(user => {
  currentUser = user;
});

export { firebase, db, auth, currentUser, devices }