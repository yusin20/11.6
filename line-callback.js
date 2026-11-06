const LINE_CHANNEL_ID = "YOUR_LINE_CHANNEL_ID";
const CALLBACK_PATH = "/line-callback.html";
const STATE_KEY = "lineLoginState";
const NONCE_KEY = "lineLoginNonce";
const status = document.querySelector("#callbackStatus");

const params = new URLSearchParams(location.search);
const error = params.get("error");
const returnedState = params.get("state");
const expectedState = sessionStorage.getItem(STATE_KEY);
const nonce = sessionStorage.getItem(NONCE_KEY);
const code = params.get("code");

sessionStorage.removeItem(STATE_KEY);
sessionStorage.removeItem(NONCE_KEY);

if (error) {
  status.textContent = `LINE 登入未完成：${params.get("error_description") || error}`;
} else if (!code || !returnedState || returnedState !== expectedState) {
  status.textContent = "登入驗證失敗：授權狀態不符，請返回網站再試一次。";
} else {
  // Exchanging the authorization code requires the LINE channel secret.
  // It must only be handled by a trusted backend, never by browser code.
  status.textContent = "已收到 LINE 授權；此網站尚未設定安全的登入後端，無法驗證並完成登入。";
}

const cleanUrl = new URL(location.href);
cleanUrl.search = "";
history.replaceState({}, "", cleanUrl);
