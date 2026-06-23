const firebaseConfig = {
  apiKey: "AIzaSyAjk0SrVY2fFANvCnw7YuPvXUWc2kZRATY",
  authDomain: "ecococha.firebaseapp.com",
  databaseURL: "https://ecococha-default-rtdb.firebaseio.com",
  projectId: "ecococha",
  storageBucket: "ecococha.firebasestorage.app",
  messagingSenderId: "464213105297",
  appId: "1:464213105297:web:2232543627c2bf8445fd30",
  measurementId: "G-FRF0PK6FVS"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();