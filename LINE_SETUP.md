# LINE LIFF 初始化與個人資料

此專案使用 LINE 官方 LIFF SDK，在 LIFF 環境初始化、依登入狀態要求使用者登入，並以 `liff.getProfile()` 取得 LINE 個人名稱、使用者 ID 和頭像網址。個人資料只用來更新當前畫面的側邊欄，不寫入 localStorage。

## LINE Developers Console 設定

1. 建立或選擇一個 Provider，建立 **LINE Login** channel。
2. 在 LINE Login channel 啟用 LIFF，新增 LIFF app。LIFF app 的 Scope 選 `profile`，以便取得名稱與頭像。
3. 將 Endpoint URL 設為正式託管的日序網站 HTTPS 根網址（不可用 `localhost` 做 LINE App 內端點）。
4. Scopes 勾選 `profile`；若只需要名稱與頭像，無須要求 `openid`、電子郵件或其他不必要授權。
5. 複製 LIFF ID，填入 `line-auth.js` 的 `LINE_LIFF_ID`。
6. 將 Endpoint URL 路徑設到日序入口（通常為 `/`），再從 LINE 應用程式/聊天中開啟 Console 顯示的 LIFF URL：`https://liff.line.me/你的LIFF_ID`。

LIFF SDK 會呼叫 `liff.init()`；未登入時由 LIFF 引導使用者登入及同意 `profile` 權限。登入後呼叫 `liff.getProfile()` 取得 `displayName` 和 `pictureUrl` 並顯示頭像。`liff.getProfile()` 需要 LIFF channel 有 `profile` scope，且在 LIFF browser 使用。不要把 LIFF profile 當成伺服器已驗證的授權憑證；若要保護伺服器資料，需由後端驗證 LIFF access token / ID token。

## 本機開發限制

LINE LIFF 必須使用已設定的 HTTPS Endpoint URL，或經 LINE Developers 支援的 LIFF 測試環境；普通 `http://localhost:8000` 不會等同正式 LIFF URL。部署後再於 LINE Developers Console 設定實際 HTTPS 網址。

## 隱私

目前程式只在記憶體中顯示 LINE 個人資料，不將名稱、user ID 或頭像寫到瀏覽器儲存空間。尚未連接資料庫，也不會同步行程。
