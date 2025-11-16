
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === "focusapp-auth" && message.token) {
      console.log("Received auth token from website:", message.token);
  
      chrome.storage.sync.set({ authToken: message.token }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Failed to save auth token:",
            chrome.runtime.lastError
          );
          sendResponse({ ok: false, error: "storage_failed" });
        } else {
          console.log("Auth token saved successfully.");
          sendResponse({ ok: true });
        }
      });
  
      return true; // keep channel open for async sendResponse
    }
  
    // Unknown message type
    sendResponse({ ok: false, error: "invalid_message" });
  });
  