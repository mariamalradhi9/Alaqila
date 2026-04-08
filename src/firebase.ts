import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvo7hl-DO2rJMcWwnzL9M9Wo2KsXe2cdo",
  authDomain: "alaqila-31e7f.firebaseapp.com",
  projectId: "alaqila-31e7f",
  storageBucket: "alaqila-31e7f.firebasestorage.app",
  messagingSenderId: "692249071391",
  appId: "1:692249071391:web:85ef272280d0632e29aa2a",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); // 🔥 هذا أهم سطر