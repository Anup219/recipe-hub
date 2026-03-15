import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDxG7SknoFIY1eKZ50bRzd9jFUrAR7yX9g",
  authDomain: "recipehub-32e19.firebaseapp.com",
  projectId: "recipehub-32e19",
  storageBucket: "recipehub-32e19.firebasestorage.app",
  messagingSenderId: "1039857504395",
  appId: "1:1039857504395:web:508e84ce5e1248243c848e",
  measurementId: "G-WDDVRZ0QLW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
