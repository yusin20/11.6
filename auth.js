import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { firebaseConfig } from "./firebase.js";

const configured = Object.values(firebaseConfig).every(
  (value) => value && !value.startsWith("YOUR_")
);

const loginButton = document.querySelector("#googleSignIn");
const logoutButton = document.querySelector("#signOut");
const authStatus = document.querySelector("#authStatus");
const profileName = document.querySelector("#profileName");
const profileAvatar = document.querySelector("#profileAvatar");
const profileEmail = document.querySelector("#profileEmail");
const profileMenu = document.querySelector("#profileMenu");

if (!configured) {
  authStatus.textContent = "請先設定 Firebase Web App 設定，才能使用 Google 登入。";
  loginButton.disabled = true;
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  loginButton.addEventListener("click", async () => {
    loginButton.disabled = true;
    authStatus.textContent = "正在連線 Google…";
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(error.code)) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          error = redirectError;
        }
      }
      authStatus.textContent = `登入失敗：${error.message}`;
      loginButton.disabled = false;
    }
  });

  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      authStatus.textContent = `登出失敗：${error.message}`;
    }
  });

  onAuthStateChanged(auth, (user) => {
    document.body.classList.toggle("signed-in", Boolean(user));
    loginButton.hidden = Boolean(user);
    logoutButton.hidden = !user;
    profileMenu.disabled = !user;
    if (user) {
      const displayName = user.displayName || user.email || "Google 使用者";
      profileName.textContent = displayName;
      profileEmail.textContent = user.email || "已使用 Google 登入";
      profileAvatar.textContent = displayName.trim().charAt(0).toUpperCase();
      profileAvatar.setAttribute("aria-label", displayName);
      authStatus.textContent = "已使用 Google 帳號登入。";
    } else {
      profileName.textContent = "訪客";
      profileEmail.textContent = "尚未登入";
      profileAvatar.textContent = "?";
      profileAvatar.setAttribute("aria-label", "訪客");
      authStatus.textContent = "登入後即可使用個人工作區。";
    }
  });
}
