# LINE Login 設定與安全流程

## 目前狀態

網站已加入 LINE 登入按鈕與 OAuth 2.1 授權導向流程，但 **尚未完成安全的登入**。目前 `line-callback.js` 會驗證 OAuth `state`，並明確拒絕把授權碼當成登入成功。真正登入需要一個可信任後端，使用 LINE Channel Secret 交換授權碼、驗證 ID token，之後才可建立網站 session。不得把 Channel Secret 放在 HTML、瀏覽器 JavaScript、GitHub 或 `localStorage`。

## LINE Developers Console

1. 在 LINE Developers Console 建立 Provider。
2. 建立 **LINE Login** channel，選擇 Web app。
3. 設定 Web app 名稱及圖示，於 LINE Login 設定中加入 callback URL：
   - 本機：`http://localhost:8000/line-callback.html`
   - 正式環境：`https://你的網域/line-callback.html`
4. 複製 Channel ID，填入 `line-auth.js` 與 `line-callback.js` 的 `LINE_CHANNEL_ID`。
5. 將正式網站網域登記於該 channel 的 Web app 網域設定。
6. Channel Secret 只提供給後端環境變數使用，不要放入此靜態前端專案。

## 必須完成後端

部署 OAuth callback endpoint（例如 `/auth/line/callback`），由伺服器：

1. 以 server-side session 驗證 `state`。
2. 向 `https://api.line.me/oauth2/v2.1/token` 交換 authorization code，附上 Channel ID、Channel Secret、相同的 `redirect_uri`。
3. 驗證 ID token 的 issuer、audience、nonce、signature、有效期限；不要信任前端傳來的 profile 或 ID token 而略過伺服器驗證。
4. 建立安全的 `HttpOnly; Secure; SameSite=Lax` session cookie，完成後導回網站。
5. 提供登出 endpoint 清除 session。

只有在受信任後端實作完成並部署後，LINE Login 才能安全地用於正式登入。前端目前不會將未驗證的 OAuth callback 資料視為登入成功。

## 為何需要後端

本專案目前是純靜態前端託管。LINE Login 回傳的 authorization code 必須帶 Channel Secret 交換 access token；如果在瀏覽器交換，secret 會洩漏給所有訪客。因此前端不能安全地完成 LINE 帳號驗證。要真正部署，需加一個可信任後端（例如 Firebase Cloud Functions / Cloud Run），將 Channel Secret 放在伺服器 secret manager，驗證 LINE ID token 後發 session cookie。不要把按鈕可見或 OAuth callback 有 code 當作已登入。
