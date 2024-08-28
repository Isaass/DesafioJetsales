// Listener para quando a extensão é instalada ou atualizada
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extensão instalada.");
});

// Listener para mensagens enviadas pelo popup ou content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "saveChatState") {
    // Armazenar o estado do chatbot no armazenamento da extensão
    chrome.storage.local.set({ chatState: message.state }, () => {
      console.log("Estado do chatbot salvo.");
    });
  }

  if (message.type === "getChatState") {
    // Recuperar o estado do chatbot do armazenamento da extensão
    chrome.storage.local.get("chatState", (data) => {
      sendResponse({ state: data.chatState });
    });
    return true; // Manter o canal de comunicação aberto para enviar uma resposta assíncrona
  }
});