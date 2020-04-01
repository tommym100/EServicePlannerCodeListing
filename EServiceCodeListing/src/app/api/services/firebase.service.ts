import * as firebase from "firebase/app";
import "firebase/database"; //import database service
import "firebase/auth"; //import auth service

//firebase config data
const config = {
    apiKey: "",
    authDomain: ".firebaseapp.com",
    databaseURL: "https://firebaseio.com",
    storageBucket: "gs://appspot.com"
  };

//initilize the firebase SDK  
firebase.initializeApp(config);

export default firebase;