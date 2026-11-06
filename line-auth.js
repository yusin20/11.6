const LINE_CHANNEL_ID = "YOUR_LINE_CHANNEL_ID";
const CALLBACK_PATH = "/line-callback.html";
const STATE_KEY = "lineLoginState";
const NONCE_KEY = "lineLoginNonce";
const PROFILE_KEY = "lineProfile";

const loginButton = document.querySelector("#lineSignIn");
const status = document.querySelector("#authStatus");
const logoutButton = document.querySelector("#signOut");
const profileName = document.querySelector("#profileName");
const profileAvatar = document.querySelector("#profileAvatar");
const profileEmail = document.querySelector("#profileEmail");
const profileMenu = document.querySelector("#profileMenu");

function applyLineProfile(profile) {
  const signedIn = Boolean(profile?.userId);
  document.body.classList.toggle("signed-in", signedIn);
  document.body.classList.toggle("line-signed-in", signedIn);
  loginButton.hidden = signedIn;
  if (logoutButton) logoutButton.hidden = !signedIn;
  if (profileMenu) profileMenu.disabled = !signedIn;
  if (signedIn) {
    profileName.textContent = profile.displayName || "LINE 使用者";
    profileEmail.textContent = "已使用 LINE 登入";
    profileAvatar.textContent = (profile.displayName || "L").trim().charAt(0).toUpperCase();
    profileAvatar.setAttribute("aria-label", profile.displayName || "LINE 使用者");
    status.textContent = "已使用 LINE 帳號登入。";
  } else if (!status.textContent.startsWith("登入失敗")) {
    profileName.textContent = "訪客";
    profileEmail.textContent = "尚未登入";
    profileAvatar.textContent = "?";
    profileAvatar.setAttribute("aria-label", "訪客");
    status.textContent = "選擇 Google 或 LINE 登入。";
  }
}

function randomBase64Url(byteCount = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteCount));
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function beginLineLogin() {
  if (!LINE_CHANNEL_ID || LINE_CHANNEL_ID.startsWith("YOUR_")) {
    status.textContent = "LINE 登入介面已加入；尚需設定 LINE Channel ID 和安全登入後端。請參閱 LINE_SETUP.md。";
    return;
  }
  if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
    status.textContent = "LINE 登入需使用 HTTPS 網站，或在 localhost 測試。";
    return;
  }

  const state = randomBase64Url();
  const nonce = randomBase64Url();
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(NONCE_KEY, nonce);

  const redirectUri = new URL(CALLBACK_PATH, location.origin).href;
  const query = new URLSearchParams({
    response_type: "code",
    client_id: LINE_CHANNEL_ID,
    redirect_uri: redirectUri,
    state,
    scope: "profile openid",
    nonce,
  });
  location.assign(`https://access.line.me/oauth2/v2.1/authorize?${query}`);
}

loginButton?.addEventListener("click", beginLineLogin);

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem(PROFILE_KEY);
    applyLineProfile(null);
    status.textContent = "已登出 LINE。";
  });
}

const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
applyLineProfile(savedProfile);

window.finishLineLogin = (profile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  applyLineProfile(profile);
};
