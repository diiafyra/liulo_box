import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
const firebaseConfig = { 
    apiKey : "AIzaSyBGvI-7xGgZox3qgji0NMZRbA9TDsbL8uw" , 
    authDomain : "liulobox.firebaseapp.com" , 
    projectId : "liulobox" , 
    storageBucket : "liulobox.firebasestorage.app" , 
    messagingSenderId : "682711844860" , 
    appId : "1:682711844860:web:7c8fb199a58d7f2a6d9479" 
  };

  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const googleProvider = new GoogleAuthProvider();
  export { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };