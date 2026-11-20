# Firebase Google 登入設定

本專案以 npm 安裝 Firebase JavaScript SDK，並透過 Vite 建置 GitHub Pages 靜態網站；Firebase Authentication 提供 Google 登入。Firebase Web 設定值是前端公開設定，不是服務帳戶私密金鑰；不要把 service account JSON、Admin SDK 私鑰或其他伺服器憑證放進前端。

## 1. 建立 Firebase Web App

1. 到 Firebase Console 建立或選擇專案。
2. 在專案設定中新增 Web app，複製 SDK 設定。
3. 註冊完成後，在 Firebase Console 的 SDK 設定區選「使用 `<script>` 標記」，把設定物件中的 `apiKey`、`authDomain`、`projectId`、`appId` 等值填進 `firebase.js`。目前 `firebase.js` 已填入你提供的截圖中的 Web App 設定。

本專案已透過 `package.json` 安裝 Firebase JavaScript SDK，`firebase-app.js` 會初始化 Firebase App 與 Authentication，登入程式共用同一個 Auth instance。

## 2. 啟用 Google 登入

在 Firebase Console 開啟 **Authentication → Sign-in method**，啟用 **Google** 並設定支援電子郵件。

在 **Authentication → Settings → Authorized domains** 加入實際網站網域。使用本機測試時依 Firebase Console 的要求加入 `localhost`；正式部署時加入正式網域。`file://` 無法作為授權網域，請用 HTTP(S) 伺服器開啟。啟用 Authentication 前，瀏覽器登入 API 可能回覆 `CONFIGURATION_NOT_FOUND`。

## 3. 使用 Firebase npm 套件

專案已設定 `firebase` 與 Vite。安裝依賴並啟動開發伺服器：

```sh
npm install
npm run dev
```

Vite 顯示本機網址後，用瀏覽器開啟；正式版用 `npm run build` 建置到 `dist/`，GitHub Actions 會自動建置並部署。若瀏覽器或部署環境不允許彈出視窗，登入流程會改用重新導向。

## 4. Firestore 資料庫

應用程式現在把任務、行程與目標儲存在 Firestore 的 `users/{uid}/tasks`、`users/{uid}/events`、`users/{uid}/goals` 子集合中。每個登入者只會讀寫自己的資料；首次登入時，若該帳號的雲端集合尚無資料，網站會把此瀏覽器原有的 localStorage 資料（若存在）匯入該帳號。

請先在 Firebase Console 的 **Firestore Database** 建立資料庫（選正式模式），並到 **Firestore Database → Rules** 貼上專案根目錄的 `firestore.rules` 內容後按 **Publish**。若未建立資料庫或未發布安全規則，網站會顯示 Firestore 錯誤。請勿將規則設成公開讀寫。

Google 登入可直接以 Firebase Authentication UID 作為資料隔離鍵。LINE LIFF 只提供 LINE profile，不會直接登入 Firebase Auth，因此目前雲端儲存請使用 Google 登入；不要將前端提供的 LINE 使用者 ID 當作安全登入憑證。

## LINE LIFF

LINE 按鈕透過 LIFF SDK 初始化並取得使用者個人名稱和頭像。設定 LIFF ID、scope 與 endpoint 的步驟請參閱 `LINE_SETUP.md`。
