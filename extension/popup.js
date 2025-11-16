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

// ---------- INLINE LOGIN SCREEN (INSIDE EXTENSION) ----------
function renderInlineLoginScreen() {
  document.getElementById("popup").innerHTML = `
    <h3>Focus App</h3>
    <p style="font-size:12px;">
      Dev login inside the extension (no real backend yet).
    </p>
    <label style="font-size:12px;">Email</label>
    <input id="email" type="email" placeholder="you@example.com" />

    <label style="font-size:12px; margin-top:6px; display:block;">Password</label>
    <input id="password" type="password" placeholder="••••••••" />

    <button id="loginBtn">Log in</button>
    <button id="backBtn" style="margin-top:6px;">Back</button>
    <p id="status" style="margin-top:8px; font-size:12px;"></p>
  `;

  const statusEl = document.getElementById("status");
  const loginBtn = document.getElementById("loginBtn");
  const backBtn = document.getElementById("backBtn");

  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      statusEl.textContent = "Please enter email and password.";
      return;
    }

    // 🔒 FAKE CHECK (for now everything passes)
    // Later you can replace this with a real fetch() call.
    const fakeToken = "dev-token-for-" + email;

    await chrome.storage.sync.set({ authToken: fakeToken });
    statusEl.textContent = "Login successful!";
    setTimeout(renderSessionScreen, 400);
  });

  backBtn.addEventListener("click", () => {
    renderConnectScreen();
  });
}

// ---- CONNECT SCREEN (CHOOSE LOGIN METHOD) ----
function renderConnectScreen() {
  document.getElementById("popup").innerHTML = `
    <h3>Focus App</h3>
    <p style="font-size:12px;">
      Log in to start a focus session.
    </p>
    <button id="inlineLoginBtn">Log in here (extension)</button>
    <button id="openLogin">Log in on website</button>
    <p id="status" style="margin-top:8px; font-size:12px;"></p>
  `;

  const statusEl = document.getElementById("status");
  const inlineLoginBtn = document.getElementById("inlineLoginBtn");
  const openLoginBtn = document.getElementById("openLogin");

  // Option 1: login directly inside the extension
  inlineLoginBtn.addEventListener("click", () => {
    renderInlineLoginScreen();
  });

  // Option 2: open website login page
  openLoginBtn.addEventListener("click", () => {
    chrome.tabs.create({
      // TODO: replace with your real site URL later
      url: "https://about.canvas.ubc.ca/"
    });
    statusEl.textContent =
      "Login page opened. After logging in on the website, reopen this popup.";
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
    statusEl.textContent =
      "Focus mode ON. Instagram, YouTube & Netflix have been yeeted 🚫";
  });

  document.getElementById("endBtn").addEventListener("click", async () => {
    await chrome.storage.sync.set({ sessionActive: false });
    await disableBlocking();
    statusEl.textContent = "Session ended. The fun apps are free again 🎉";
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await chrome.storage.sync.remove("authToken");
    await disableBlocking();
    renderConnectScreen();
  });
}

// ---------- INIT ----------
async function init() {
  const { authToken } = await chrome.storage.sync.get("authToken");

  if (authToken) {
    // Either inline login OR website login already saved a token
    renderSessionScreen();
  } else {
    // No token yet → show login choices
    renderConnectScreen();
  }
}

init();
