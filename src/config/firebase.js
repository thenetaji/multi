import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDaG-kZPfb00ulrv_H0AuOs8EJjXcTHtFk",
  authDomain: "multiagent-b23e0.firebaseapp.com",
  projectId: "multiagent-b23e0",
  storageBucket: "multiagent-b23e0.appspot.com",
  messagingSenderId: "381852074525",
  appId: "1:381852074525:web:27f597a165b8bcac6f3cf4",
  measurementId: "G-PLK09BSJMW"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);

// ייצוא שירותים
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 