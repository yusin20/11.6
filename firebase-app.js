import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

import { firebaseAppCheckSiteKey, firebaseConfig } from "./firebase.js";

// One Firebase app and Auth instance shared by all client-side Firebase features.
export const firebaseApp = initializeApp(firebaseConfig);
const appCheckSiteKey = firebaseAppCheckSiteKey;
if (appCheckSiteKey) {
  if (import.meta.env.DEV && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    const debugTokenStorageKey = "dayplanner-firebase-app-check-debug-token";
    let debugToken = localStorage.getItem(debugTokenStorageKey);
    if (!debugToken) {
      debugToken = crypto.randomUUID();
      localStorage.setItem(debugTokenStorageKey, debugToken);
    }
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
    window.dayPlannerAppCheckDebugToken = debugToken;
  }
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);
export const appCheckConfigured = Boolean(appCheckSiteKey);
