import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { appCheckConfigured, firebaseApp } from "./firebase-app.js";

const dialog = document.querySelector("#aiAssistantDialog");
const openButton = document.querySelector("#openAiAssistant");
const closeButton = document.querySelector("#closeAiAssistant");
const form = document.querySelector("#aiChatForm");
const questionInput = document.querySelector("#aiQuestion");
const sendButton = document.querySelector("#aiSend");
const messages = document.querySelector("#aiChatMessages");
const status = document.querySelector("#aiChatStatus");
let chat;
let chatHistory = [];
let activeModel = "gemini-3.5-flash-lite";
const systemInstruction = "你是日序（個人行程與任務管理工具）的繁體中文 AI 助理。回答清楚、友善、簡潔。不可聲稱自己已替使用者新增、修改或刪除資料；只能提供建議。若使用者詢問目前資料，僅根據他本次提供的日序資料回答，沒有資料就說明限制。";
const generationConfig = { temperature: 0.55, maxOutputTokens: 900 };

openButton?.addEventListener("click", () => {
  dialog.showModal();
  questionInput.focus();
});
closeButton?.addEventListener("click", () => dialog.close());

function addMessage(text, role) {
  const message = document.createElement("div");
  message.className = `ai-message ai-message-${role}`;
  message.textContent = text;
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
}

function getChat() {
  if (!appCheckConfigured) {
    throw new Error("App Check 尚未完成設定。請檢查 Firebase App Check 的網站金鑰設定。");
  }
  if (!chat) {
    chat = createChat(activeModel);
  }
  return chat;
}

function createChat(modelName) {
  const ai = getAI(firebaseApp, {
    backend: new GoogleAIBackend(),
    useLimitedUseAppCheckTokens: true,
  });
  const model = getGenerativeModel(ai, { model: modelName, systemInstruction, generationConfig });
  return model.startChat({ history: chatHistory });
}

function isTransientServiceError(error) {
  return /\b503\b|\bUNAVAILABLE\b|deadline expired|temporarily unavailable/i.test(error?.message || "");
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = questionInput.value.trim();
  if (!question) return;
  addMessage(question, "user");
  questionInput.value = "";
  questionInput.disabled = true;
  sendButton.disabled = true;
  status.textContent = "AI 正在思考…";
  try {
    const context = window.getDayPlannerContext?.();
    const contextText = context ? `\n\n目前日序資料（僅供回答本題）：\n${JSON.stringify(context)}` : "";
    const prompt = `${question}${contextText}`;
    let result;
    try {
      result = await getChat().sendMessage(prompt);
    } catch (error) {
      if (!isTransientServiceError(error)) throw error;
      status.textContent = "AI 回應較慢，正在切換模型重試…";
      activeModel = activeModel === "gemini-3.5-flash-lite" ? "gemini-3.8-flash" : "gemini-3.5-flash-lite";
      chat = createChat(activeModel);
      try {
        result = await chat.sendMessage(prompt);
      } catch (fallbackError) {
        chat = undefined;
        throw fallbackError;
      }
    }
    const answer = result.response.text();
    if (!answer.trim()) throw new Error("AI 沒有產生文字回覆，請再試一次。");
    addMessage(answer, "assistant");
    chatHistory.push(
      { role: "user", parts: [{ text: prompt }] },
      { role: "model", parts: [{ text: answer }] },
    );
    status.textContent = "";
  } catch (error) {
    console.error("AI assistant request failed", error);
    const debugToken = window.dayPlannerAppCheckDebugToken;
    if (import.meta.env.DEV && debugToken && /appCheck|403/i.test(error.message || "")) {
      status.replaceChildren(document.createTextNode("本機 App Check 權杖尚未在 Firebase 登記。偵錯權杖："));
      const token = document.createElement("code");
      token.textContent = debugToken;
      status.append(token);
    } else {
      status.textContent = error.message || "AI 暫時無法回覆，請稍後再試。";
    }
  } finally {
    questionInput.disabled = false;
    sendButton.disabled = false;
    questionInput.focus();
  }
});
