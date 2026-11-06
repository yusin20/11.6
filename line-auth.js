const LINE_LIFF_ID = "YOUR_LIFF_ID";

const loginButton = document.querySelector("#lineSignIn");
const status = document.querySelector("#authStatus");
const logoutButton = document.querySelector("#signOut");
const profileName = document.querySelector("#profileName");
const profileAvatar = document.querySelector("#profileAvatar");
const profileEmail = document.querySelector("#profileEmail");
const profileMenu = document.querySelector("#profileMenu");
let lineSignedIn = false;

function applyLineProfile(profile) {
  lineSignedIn = Boolean(profile?.userId);
  document.body.classList.toggle("line-signed-in", lineSignedIn);
  document.body.classList.toggle("signed-in", lineSignedIn || document.body.classList.contains("google-signed-in"));
  if (loginButton) loginButton.hidden = lineSignedIn;
  if (logoutButton && !document.body.classList.contains("google-signed-in")) logoutButton.hidden = !lineSignedIn;
  if (profileMenu) profileMenu.disabled = !lineSignedIn && !document.body.classList.contains("google-signed-in");
  if (lineSignedIn) {
    profileName.textContent = profile.displayName || "LINE 使用者";
    profileEmail.textContent = "已使用 LINE 登入";
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
    status.textContent = "已使用 LINE 帳號登入。";
  } else if (!document.body.classList.contains("google-signed-in")) {
    profileName.textContent = "訪客";
    profileEmail.textContent = "尚未登入";
    profileAvatar.replaceChildren(document.createTextNode("?"));
    profileAvatar.setAttribute("aria-label", "訪客");
    status.textContent = "選擇 Google 或 LINE 登入。";
  }
}

async function initLiff() {
  if (!LINE_LIFF_ID || LINE_LIFF_ID.startsWith("YOUR_")) {
    status.textContent = "請先在 line-auth.js 設定 LINE Developers 建立的 LIFF ID。";
    return;
  }

  loginButton.disabled = true;
  status.textContent = "正在初始化 LINE…";
  try {
    await liff.init({ liffId: LINE_LIFF_ID });
    if (!liff.isLoggedIn()) {
      status.textContent = "請使用 LINE 帳號登入並授權個人檔案。";
      loginButton.disabled = false;
      return;
    }

    const profile = await liff.getProfile();
    applyLineProfile(profile);
    loginButton.disabled = false;
  } catch (error) {
    console.error("LIFF initialization failed", error);
    status.textContent = `LINE 初始化失敗：${error.message || "請檢查 LIFF ID 與端點設定。"}`;
    loginButton.disabled = false;
  }
}

loginButton?.addEventListener("click", () => {
  if (window.liff?.isLoggedIn()) return;
  if (window.liff) liff.login({ redirectUri: window.location.href });
  else status.textContent = "LIFF SDK 尚未載入，請重新整理頁面。";
});

logoutButton?.addEventListener("click", () => {
  if (window.liff?.isLoggedIn()) liff.logout();
  applyLineProfile(null);
});

initLiff();
