const LINE_LIFF_ID = "2012591140-fkt0rsTT";

const loginButton = document.querySelector("#lineSignIn");
const status = document.querySelector("#authStatus");
const logoutButton = document.querySelector("#signOut");
const profileName = document.querySelector("#profileName");
const profileAvatar = document.querySelector("#profileAvatar");
const profileEmail = document.querySelector("#profileEmail");
const profileMenu = document.querySelector("#profileMenu");
let lineSignedIn = false;

function setAvatar(profile) {
  lineSignedIn = Boolean(profile?.userId);
  profileAvatar.replaceChildren();
  if (profile.pictureUrl) {
    const image = document.createElement("img");
    image.src = profile.pictureUrl;
    image.alt = "";
    image.referrerPolicy = "no-referrer";
    profileAvatar.append(image);
  } else {
    profileAvatar.textContent = (profile.displayName || "L").trim().charAt(0).toUpperCase();
  }
  profileAvatar.setAttribute("aria-label", profile.displayName || "LINE 使用者");
}

function setVisitorIfNoGoogle() {
  if (document.body.classList.contains("google-signed-in")) return;
  document.body.classList.remove("line-signed-in", "signed-in");
  profileName.textContent = "訪客";
  profileEmail.textContent = "尚未登入";
  profileAvatar.replaceChildren(document.createTextNode("?"));
  profileAvatar.setAttribute("aria-label", "訪客");
  profileMenu.disabled = true;
  logoutButton.hidden = true;
  loginButton.hidden = false;
  status.textContent = "選擇 Google 或 LINE 登入。";
}

async function initLiff() {
  if (!LINE_LIFF_ID || LINE_LIFF_ID.startsWith("YOUR_")) {
    status.textContent = "請先在 line-auth.js 設定 LINE Developers 建立的 LIFF ID。";
    return;
  }

  loginButton.disabled = true;
  status.textContent = "正在初始化 LINE…";
  try {
    await liff.init({ liffId: LINE_LIFF_ID, withLoginOnExternalBrowser: true });
    if (!liff.isLoggedIn()) {
      status.textContent = "請使用 LINE 帳號登入並授權個人檔案。";
      loginButton.disabled = false;
      return;
    }

    const profile = await liff.getProfile();
    document.body.classList.add("line-signed-in", "signed-in");
    profileName.textContent = profile.displayName || "LINE 使用者";
    profileEmail.textContent = "已使用 LINE 登入";
    setAvatar(profile);
    profileMenu.disabled = false;
    logoutButton.hidden = false;
    loginButton.hidden = true;
    status.textContent = "已使用 LINE 帳號登入。";
  } catch (error) {
    console.error("LIFF initialization failed", error);
    status.textContent = `LINE 初始化失敗：${error.message || "請檢查 LIFF ID 與端點設定。"}`;
  } finally {
    loginButton.disabled = false;
  }
}

loginButton?.addEventListener("click", () => {
  if (window.liff?.isLoggedIn()) return;
  if (window.liff) liff.login({ redirectUri: window.location.href });
  else status.textContent = "LIFF SDK 尚未載入，請重新整理頁面。";
});

window.addEventListener("app-auth-state", (event) => {
  const user = event.detail?.user;
  if (!user && !lineSignedIn) setVisitorIfNoGoogle();
});

logoutButton?.addEventListener("click", (event) => {
  if (lineSignedIn && window.liff?.isLoggedIn()) {
    event.preventDefault();
    liff.logout();
    lineSignedIn = false;
    document.body.classList.remove("line-signed-in");
    setVisitorIfNoGoogle();
    status.textContent = "已登出日序的 LINE 登入狀態。請選擇 Google 登入；LINE App 仍可能保留自己的登入工作階段。";
  }
});

initLiff();
