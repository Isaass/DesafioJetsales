chrome.action.onClicked.addListener(async (tab) => {
  // Verifica se o URL é um URL permitido
  if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
    // Verifica o estado atual do iframe
    const { isChatbaseOpen } = await chrome.storage.local.get('isChatbaseOpen');
    const newState = !isChatbaseOpen;

    // Atualiza o estado
    await chrome.storage.local.set({ isChatbaseOpen: newState });

    if (newState) {
      // Injeta o iframe na página ativa
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: openChatbaseIframe
      });
    } else {
      // Remove o iframe da página ativa
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: closeChatbaseIframe
      });
    }
  } else {
    console.warn('Não é possível injetar scripts em URLs chrome:// ou outras URLs restritas.');
  }
});

// Função para abrir o iframe
function openChatbaseIframe() {
  if (document.getElementById('chatbot-iframe')) return;

  const iframe = document.createElement('iframe');
  iframe.id = 'chatbot-iframe';
  iframe.src = 'https://www.chatbase.co/chatbot-iframe/zlnVUth7Z5O5r2KdbhL4a';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.top = '0';
  iframe.style.width = '400px';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.zIndex = '9999';
  document.body.appendChild(iframe);

  // Salva a conversa quando o iframe é carregado
  iframe.onload = () => {
    // Escuta mensagens vindas do chatbot
    iframe.contentWindow.addEventListener('message', (event) => {
      if (event.origin === 'https://www.chatbase.co') {
        if (event.data.type === 'SAVE_CHAT_STATE') {
          chrome.storage.local.set({ chatState: event.data.state });
        }
      }
    });

    // Carrega a conversa salva
    chrome.storage.local.get('chatState', (data) => {
      if (data.chatState) {
        iframe.contentWindow.postMessage({ type: 'LOAD_CHAT_STATE', state: data.chatState }, 'https://www.chatbase.co');
      }
    });
  };
}

// Função para fechar o iframe
function closeChatbaseIframe() {
  const iframe = document.getElementById('chatbot-iframe');
  if (iframe) {
    iframe.remove();
  }
}

// Mantém o estado do iframe na navegação
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get('isChatbaseOpen', (result) => {
    if (result.isChatbaseOpen) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: openChatbaseIframe
        });
      });
    }
  });
});