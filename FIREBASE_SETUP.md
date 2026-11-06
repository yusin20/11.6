# Firebase Google 登入設定

本專案使用 Firebase Authentication 的 Google 提供者。Firebase Web 設定值是前端公開設定，不是服務帳戶私密金鑰；不要把 service account JSON、Admin SDK 私鑰或其他伺服器憑證放進前端。

## 1. 建立 Firebase Web App

1. 到 Firebase Console 建立或選擇專案。
2. 在專案設定中新增 Web app，複製 SDK 設定。
3. 註冊完成後，在 Firebase Console 的 SDK 設定區選「使用 `<script>` 標記」，把設定物件中的 `apiKey`、`authDomain`、`projectId`、`appId` 等值填進 `firebase.js`。目前 `firebase.js` 已填入你提供的截圖中的 Web App 設定。

## 2. 啟用 Google 登入

在 Firebase Console 開啟 **Authentication → Sign-in method**，啟用 **Google** 並設定支援電子郵件。

在 **Authentication → Settings → Authorized domains** 加入實際網站網域。使用本機測試時依 Firebase Console 的要求加入 `localhost`；正式部署時加入正式網域。`file://` 無法作為授權網域，請用 HTTP(S) 伺服器開啟。啟用 Authentication 前，瀏覽器登入 API 可能回覆 `CONFIGURATION_NOT_FOUND`。

## 3. 本機測試

在專案目錄執行：

```sh
python3 -m http.server 8000
```

然後開啟 `http://localhost:8000/`。若瀏覽器或部署環境不允許彈出視窗，登入流程會改用重新導向。

## 注意

目前行程、任務與目標仍儲存在瀏覽器的 `localStorage`，登入僅負責 Google 身分驗證，不會自動同步到 Firebase/Firestore 或其他裝置。
