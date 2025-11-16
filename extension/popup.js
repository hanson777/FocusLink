const API_BASE = "https://student-focus-app-backend.onrender.com";


// ---------- BLOCKING HELPERS ----------
// Rule IDs for each site – must be unique integers
const RULE_ID_INSTAGRAM = 1;
const RULE_ID_YOUTUBE = 2;
const RULE_ID_NETFLIX = 3;

async function enableBlocking() {
  // Remove old rules first (just in case)
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID_INSTAGRAM, RULE_ID_YOUTUBE, RULE_ID_NETFLIX],
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
    ]
  });
}

async function disableBlocking() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID_INSTAGRAM, RULE_ID_YOUTUBE, RULE_ID_NETFLIX],
    addRules: []
  });
}

// ---------- HELPER: START TIMER SESSION VIA BACKEND ----------
function startTimerSession(payload) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["authToken"], async (result) => {
      const authToken = result.authToken;

      if (!authToken) {
        reject(new Error("No auth token found. Please log in first."));
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/timer/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Timer start failed: ${res.status} ${text}`);
        }

        const data = await res.json().catch(() => ({}));
        console.log("Timer session started:", data);
        resolve(data);
      } catch (err) {
        console.error("Failed to start timer session:", err);
        reject(err);
      }
    });
  });
}

// ---------- INLINE LOGIN SCREEN (INSIDE EXTENSION) ----------
function renderInlineLoginScreen() {
  document.getElementById("popup").innerHTML = `
      <div class='card'>
        <h3>Focus App</h3>
        <p style="font-size:12px;">
          Log in to your Focus account.
        </p>
  
        <label style="font-size:12px;">Username</label>
        <input id="username" type="text" placeholder="yourusername" />
  
        <label style="font-size:12px; margin-top:6px; display:block;">Password</label>
        <input id="password" type="password" placeholder="••••••••" />
  
        <button id="loginBtn">Log in</button>
        <button id="backBtn" style="margin-top:6px;">Back</button>
        <p id="status" style="margin-top:8px; font-size:12px;"></p>
      </div>
    `;

  const statusEl = document.getElementById("status");
  const loginBtn = document.getElementById("loginBtn");
  const backBtn = document.getElementById("backBtn");

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      loginBtn.click();   
    }
  });  

  loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      statusEl.textContent = "Please enter username and password.";
      return;
    }

    statusEl.textContent = "Logging in...";

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ username, password })  // UserLoginModel
      });

      if (!res.ok) {
        if (res.status === 401) {
          statusEl.textContent = "Incorrect username or password.";
        } else {
          statusEl.textContent = "Server error. Please try again.";
        }
        return;
      }

      const data = await res.json();
      // data = { access_token, token_type, user: { uid, username } }

      await chrome.storage.sync.set({
        authToken: data.access_token,
        username: data.user.username,
        userUid: data.user.uid
      });

      statusEl.textContent = "Login successful!";
      setTimeout(renderSessionScreen, 400);
    } catch (err) {
      console.error("Login/network error:", err);
      statusEl.textContent = "Network error: " + (err.message || "Please try again.");
    }
  });

  backBtn.addEventListener("click", () => {
    renderConnectScreen();
  });
}

// ---------- REGISTER SCREEN (INSIDE EXTENSION) ----------
function renderRegisterScreen() {
    document.getElementById("popup").innerHTML = `
      <div class='card'>
        <h3>Focus App</h3>
        <p style="font-size:12px;">
          Create a new Focus account.
        </p>
  
        <label style="font-size:12px;">Username</label>
        <input id="regUsername" type="text" placeholder="yourusername" />
  
        <label style="font-size:12px; margin-top:6px; display:block;">Email</label>
        <input id="regEmail" type="email" placeholder="you@example.com" />
  
        <label style="font-size:12px; margin-top:6px; display:block;">First name</label>
        <input id="regFirstName" type="text" placeholder="Annie" />
  
        <label style="font-size:12px; margin-top:6px; display:block;">Last name</label>
        <input id="regLastName" type="text" placeholder="Zhang" />
  
        <label style="font-size:12px; margin-top:6px; display:block;">Password</label>
        <input id="regPassword" type="password" placeholder="••••••••" />
  
        <button id="registerBtn">Sign up</button>
        <button id="backBtn" style="margin-top:6px;">Back</button>
        <p id="status" style="margin-top:8px; font-size:12px;"></p>
      </div>
    `;
  
    const statusEl = document.getElementById("status");
    const registerBtn = document.getElementById("registerBtn");
    const backBtn = document.getElementById("backBtn");

    document.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            registerBtn.click();   
        }
      });
  
    registerBtn.addEventListener("click", async () => {
      const username  = document.getElementById("regUsername").value.trim();
      const email     = document.getElementById("regEmail").value.trim();
      const firstName = document.getElementById("regFirstName").value.trim();
      const lastName  = document.getElementById("regLastName").value.trim();
      const password  = document.getElementById("regPassword").value.trim();
  
      if (!username || !email || !firstName || !lastName || !password) {
        statusEl.textContent = "Please fill in all fields.";
        return;
      }
  
      // Simple extra check so users see nicer errors
      if (!email.includes("@")) {
        statusEl.textContent = "Please enter a valid email address.";
        return;
      }
  
      statusEl.textContent = "Creating your account...";
      registerBtn.disabled = true;
  
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            // 🔐 MUST match UserCreateModel exactly
            username: username,
            email: email,
            first_name: firstName,
            last_name: lastName,
            password: password,
          })
        });
  
        const rawText = await res.text();
        let body;
        try {
          body = rawText ? JSON.parse(rawText) : null;
        } catch {
          body = null;
        }
  
        console.log("[Register] status:", res.status);
        console.log("[Register] body:", body ?? rawText);
  
        if (!res.ok) {
          // 400 from your backend: username/email already registered, etc.
          if (res.status === 400 && body && body.detail) {
            statusEl.textContent =
              typeof body.detail === "string"
                ? body.detail
                : JSON.stringify(body.detail);
          }
          // 422: FastAPI validation error (wrong/missing fields)
          else if (res.status === 422 && body && body.detail) {
            statusEl.textContent =
              "Validation error: " + JSON.stringify(body.detail);
          } else {
            statusEl.textContent =
              `Server error (${res.status}). Please try again.`;
          }
          registerBtn.disabled = false;
          return;
        }
  
        // ✅ Success: backend returned UserModel
        statusEl.textContent = "Account created! Please log in.";
        setTimeout(renderInlineLoginScreen, 600);
      } catch (err) {
        console.error("Register/network error:", err);
        statusEl.textContent = "Network error. Please try again.";
        registerBtn.disabled = false;
      }
    });
  
    backBtn.addEventListener("click", () => {
      renderConnectScreen();
    });
  }  

// ---- CONNECT SCREEN (CHOOSE LOGIN METHOD) ----
function renderConnectScreen() {
  document.getElementById("popup").innerHTML = `
      <div class='card'>
        <h3>Focus App</h3>
        <p style="font-size:12px;">
          Log in to start a focus session.
        </p>
        <button id="inlineLoginBtn">Log in here (extension)</button>
        <button id="inlineRegisterBtn">Sign up (extension)</button>
        <button id="openLogin">Log in on website</button>
        <p id="status" style="margin-top:8px; font-size:12px;"></p>
      </div>
    `;

  const statusEl = document.getElementById("status");
  const inlineLoginBtn = document.getElementById("inlineLoginBtn");
  const inlineRegisterBtn = document.getElementById("inlineRegisterBtn");
  const openLoginBtn = document.getElementById("openLogin");

  // Option 1: login directly inside the extension
  inlineLoginBtn.addEventListener("click", () => {
    renderInlineLoginScreen();
  });

  // Option 2: sign up directly inside the extension
  inlineRegisterBtn.addEventListener("click", () => {
    renderRegisterScreen();
  });

  // Option 3: open website login page
  openLoginBtn.addEventListener("click", () => {
    chrome.tabs.create({
      url: "https://student-focus-app-1.onrender.com/"
    });
    statusEl.textContent =
      "Login page opened. After logging in on the website, reopen this popup.";
  });
}

// ---------- SESSION SCREEN ----------
function renderSessionScreen() {
    document.getElementById("popup").innerHTML = `
        <div class='card'>
          <h3>Focus App</h3>
          <p id="userInfo" style="font-size:12px; margin-bottom:8px;"></p>
  
          <button id="dashboardBtn">Open Dashboard</button>
  
          <button id="startBtn">Start Session</button>
          <button id="endBtn">End Session</button>
  
          <button id="logoutBtn" style="margin-top: 10px;">Log out</button>
          <p id="sessionStatus" style="font-size:12px; margin-top:8px;"></p>
        </div>
      `;
  
    const statusEl = document.getElementById("sessionStatus");
    const userInfoEl = document.getElementById("userInfo");
  
    const startBtn = document.getElementById("startBtn");
    const endBtn = document.getElementById("endBtn");
    const dashboardBtn = document.getElementById("dashboardBtn");
  
    // 🎨 STYLE: Dashboard button (soft blue gradient)
    dashboardBtn.style.background = "linear-gradient(135deg, #93c5fd, #60a5fa)";
    dashboardBtn.style.boxShadow = "0 4px 12px rgba(147,197,253,0.5)";
    dashboardBtn.style.color = "#fff";
    dashboardBtn.style.marginBottom = "10px";
    dashboardBtn.style.borderRadius = "999px";
    dashboardBtn.style.padding = "8px";
    dashboardBtn.style.fontSize = "13px";
    dashboardBtn.style.fontWeight = "500";
    dashboardBtn.style.cursor = "pointer";
  
    // 👉 When clicked, open the live site in a new tab
    dashboardBtn.addEventListener("click", () => {
      chrome.tabs.create({
        url: "https://student-focus-app-1.onrender.com/"
      });
    });
  
    // 🎨 color presets for Start/End buttons
    function applyDefaultColors() {
      startBtn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
      startBtn.style.boxShadow = "0 4px 10px rgba(34,197,94,0.4)";
      startBtn.style.color = "#fff";
  
      endBtn.style.background = "linear-gradient(135deg, #fbbf24, #f59e0b)";
      endBtn.style.boxShadow = "0 4px 10px rgba(251,191,36,0.4)";
      endBtn.style.color = "#fff";
    }
  
    function applySessionActiveColors() {
      startBtn.style.background = "linear-gradient(135deg, #f87171, #ef4444)";
      startBtn.style.boxShadow = "0 4px 10px rgba(239,68,68,0.4)";
      startBtn.style.color = "#fff";
  
      endBtn.style.background = "linear-gradient(135deg, #60a5fa, #3b82f6)";
      endBtn.style.boxShadow = "0 4px 10px rgba(59,130,246,0.4)";
      endBtn.style.color = "#fff";
    }
  
    chrome.storage.sync.get(["username"], (res) => {
      if (res.username) userInfoEl.textContent = `Logged in as ${res.username}`;
    });
  
    chrome.storage.sync.get(["sessionActive"], (res) => {
      if (res.sessionActive) {
        applySessionActiveColors();
      } else {
        applyDefaultColors();
      }
    });
  
    startBtn.addEventListener("click", async () => {
      try {
        statusEl.textContent = "Starting focus session...";
  
        await chrome.storage.sync.set({ sessionActive: true });
        await enableBlocking();
  
        applySessionActiveColors();
  
        statusEl.textContent = "Focus mode ON 🚫 Social apps blocked";
      } catch (err) {
        console.error(err);
        statusEl.textContent = "Failed to start session.";
      }
    });
  
    endBtn.addEventListener("click", async () => {
      await chrome.storage.sync.set({ sessionActive: false });
      await disableBlocking();
  
      applyDefaultColors();
  
      statusEl.textContent = "Session ended 🎉 Apps unblocked";
    });
  
    document.getElementById("logoutBtn").addEventListener("click", () => {
      chrome.storage.sync.remove(
        ["authToken", "username", "userUid", "sessionActive"],
        () => {
          disableBlocking();
          renderConnectScreen();
        }
      );
    });
  }  
   
// ---------- INIT ----------
function init() {
  chrome.storage.sync.get(["authToken"], (result) => {
    if (result.authToken) {
      // Token may come from:
      // - inline login in extension
      // - OR website login via site-bridge.js + background.js
      renderSessionScreen();
    } else {
      renderConnectScreen();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
