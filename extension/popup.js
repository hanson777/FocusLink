// Helper: get connection status on load
async function loadStatus() {
    const { authToken } = await chrome.storage.sync.get("authToken");
    const statusEl = document.getElementById("status");
  
    if (authToken) {
      statusEl.textContent = `Connected as: ${authToken}`;
    } else {
      statusEl.textContent = "Not connected yet.";
    }
  }

  document.getElementById("connect").addEventListener("click", async () => {
    // ---- FAKE BACKEND PART ----
    // Pretend we got a token from your server.
    // Later, replace this with a real token from API
    const fakeToken = "dev-user-123"; 
  
    try {
      // Store it so the whole extension can use it
      await chrome.storage.sync.set({ authToken: fakeToken });
  
      const statusEl = document.getElementById("status");
      statusEl.textContent = `Connected as: ${fakeToken}`;
    } catch (err) {
      console.error("Failed to save token:", err);
      alert("Failed to connect (see console).");
    }
  });
  
  // When popup opens, load current status
  loadStatus();