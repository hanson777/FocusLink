
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === "focusapp-auth" && message.token) {
      console.log("Received auth token from website:", message.token);
  
      // NEW: also store username and uid if provided
      const toStore = {
        authToken: message.token,
      };
  
      if (message.username) {
        toStore.username = message.username;
      }
      if (message.uid) {
        toStore.userUid = message.uid;
      }
  
      chrome.storage.sync.set(toStore, () => {
        if (chrome.runtime.lastError) {
          console.error("Failed to save auth token:", chrome.runtime.lastError);
          sendResponse({ ok: false, error: "storage_failed" });
        } else {
          console.log("Auth token (and user info) saved successfully.");
          sendResponse({ ok: true });
        }
      });
  
      return true; // keep channel open
    }
  
    sendResponse({ ok: false, error: "invalid_message" });
  });
  
  