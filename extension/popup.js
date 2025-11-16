
// ---------- BLOCKING HELPERS ----------

// Rule IDs for each site – must be unique integers
const RULE_ID_INSTAGRAM = 1;
const RULE_ID_YOUTUBE = 2;
const RULE_ID_NETFLIX = 3;

async function enableBlocking() {
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: RULE_ID_INSTAGRAM,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: "instagram.com",
            resourceTypes: ["main_frame"]
          }
        },
        {
          id: RULE_ID_YOUTUBE,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: "youtube.com",
            resourceTypes: ["main_frame"]
          }
        },
        {
          id: RULE_ID_NETFLIX,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: "netflix.com",
            resourceTypes: ["main_frame"]
          }
        }
      ],
      removeRuleIds: [] 
    });
  } catch (err) {
    console.error("Failed to enable blocking:", err);
  }
}

async function disableBlocking() {
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [],
      removeRuleIds: [RULE_ID_INSTAGRAM, RULE_ID_YOUTUBE, RULE_ID_NETFLIX]
    });
  } catch (err) {
    console.error("Failed to disable blocking:", err);
  }
}


// ---------- LOGIN SCREEN ----------
function renderLoginScreen() {
    document.getElementById("popup").innerHTML = `
      <h3>Focus App</h3>
      <label style="font-size:12px;">Email</label>
      <input id="email" type="email" placeholder="you@example.com" />
  
      <label style="font-size:12px; margin-top:6px; display:block;">Password</label>
      <input id="password" type="password" placeholder="••••••••" />
  
      <button id="loginBtn">Log in</button>
      <p id="status"></p>
    `;
  
    const statusEl = document.getElementById("status");
    const loginBtn = document.getElementById("loginBtn");
  
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
  
      if (!email || !password) {
        statusEl.textContent = "Please enter email and password.";
        return;
      }
  
      statusEl.textContent = "Logging in...";
  
      try {
        // TODO: replace with real API call later
        const fakeToken = "dev-token-for-" + email;
  
        await chrome.storage.sync.set({ authToken: fakeToken });
  
        statusEl.textContent = "Login successful!";
        setTimeout(renderSessionScreen, 400);
      } catch (err) {
        console.error("Login failed:", err);
        statusEl.textContent = "Login failed.";
      }
    });
  }
  
  
  // ---------- SESSION SCREEN ----------
  function renderSessionScreen() {
    document.getElementById("popup").innerHTML = `
      <h3>Focus App</h3>
      <button id="startBtn">Start Session</button>
      <button id="endBtn">End Session</button>
      <button id="logoutBtn" style="margin-top: 10px;">Log out</button>
      <p id="sessionStatus"></p>
    `;
  
    const statusEl = document.getElementById("sessionStatus");
  
    document.getElementById("startBtn").addEventListener("click", async () => {
      await chrome.storage.sync.set({ sessionActive: true });
  
      await enableBlocking();
  
      statusEl.textContent = "Focus activated. The fun apps have been jailed temporarily.";
    });
  
    document.getElementById("endBtn").addEventListener("click", async () => {
      await chrome.storage.sync.set({ sessionActive: false });
  
      await disableBlocking();
  
      statusEl.textContent = "Session ended. Blocking disabled.";
    });
  
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await chrome.storage.sync.remove("authToken");
      await disableBlocking();
      renderLoginScreen();
    });
  }
  
  // ---------- INIT ----------
  async function init() {
    const { authToken } = await chrome.storage.sync.get("authToken");
  
    if (authToken) {
      renderSessionScreen();
    } else {
      renderLoginScreen();
    }
  }
  
  init();