chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // We expect messages from site-bridge.js like:
    // { type: "focusapp-auth", token, username, uid }
    if (message.type === "focusapp-auth" && message.token) {
      console.log("Received auth token from website:", message.token);
  
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
  
      // Return true to indicate we’ll respond asynchronously
      return true;
    }
  
    // Any other message types fall through here
    sendResponse({ ok: false, error: "invalid_message" });
  });
  
  
  