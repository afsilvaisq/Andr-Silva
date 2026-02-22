import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCIVeWbkMURK-8BIU1ATEfQw9jnBm2OEOM",
  authDomain: "reliability-industrial.firebaseapp.com",
  databaseURL: "https://reliability-industrial-default-rtdb.firebaseio.com",
  projectId: "reliability-industrial",
  storageBucket: "reliability-industrial.appspot.com",
  messagingSenderId: "1052002199059",
  appId: "1:1052002199059:web:63773b9275c224d8ac41e6"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
