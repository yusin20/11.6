import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { firebaseConfig } from "./firebase.js";

// One Firebase app and Auth instance shared by all client-side Firebase features.
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
