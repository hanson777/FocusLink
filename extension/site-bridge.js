(function () {
    const STORAGE_KEYS = {
      ACCESS_TOKEN: "authToken",
      USER: "user",
    };
  
    function syncTokenToExtension() {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) return;
  
        let username, uid;
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            username = user?.username;
            uid = user?.uid;
          } catch (e) {
            console.error("Failed to parse user from localStorage:", e);
          }
        }
  
        chrome.runtime.sendMessage(
          {
            type: "focusapp-auth",
            token,
            username,
            uid,
          },
          (resp) => {
            console.log("Focus extension sync response:", resp);
          }
        );
      } catch (e) {
        console.error("Failed to sync token to extension:", e);
      }
    }
  
    // Run once on load
    syncTokenToExtension();
  
    // Also react if auth changes while page is open
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEYS.ACCESS_TOKEN || e.key === STORAGE_KEYS.USER) {
        syncTokenToExtension();
      }
    });
  })();
  