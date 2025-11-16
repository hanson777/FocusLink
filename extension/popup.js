// ---------- BLOCKING HELPERS ----------

// Rule IDs for each site – must be unique integers
const RULE_ID_INSTAGRAM = 1;
const RULE_ID_YOUTUBE = 2;
const RULE_ID_NETFLIX = 3;
const API_BASE = "https://undelved-censorable-ethan.ngrok-free.dev"; 

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
        Log in to your Focus account.
      </p>
  
      <label style="font-size:12px;">Username</label>
      <input id="username" type="text" placeholder="yourusername" />
  
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
        statusEl.textContent = "Network error. Please try again.";
      }
    });
  
    backBtn.addEventListener("click", () => {
      renderConnectScreen();
    });
  }  

// ---------- REGISTER SCREEN (INSIDE EXTENSION) ----------
function renderRegisterScreen() {
  document.getElementById("popup").innerHTML = `
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
  `;

  const statusEl = document.getElementById("status");
  const registerBtn = document.getElementById("registerBtn");
  const backBtn = document.getElementById("backBtn");

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

    statusEl.textContent = "Creating your account...";

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName
        })
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 400 && body.detail) {
          // e.g. "Username already registered" / "Email already registered"
          statusEl.textContent = body.detail;
        } else {
          statusEl.textContent = "Server error. Please try again.";
        }
        return;
      }

      // Backend returns a UserModel, no token.
      statusEl.textContent = "Account created! Please log in.";
      setTimeout(renderInlineLoginScreen, 600);
    } catch (err) {
      console.error("Register/network error:", err);
      statusEl.textContent = "Network error. Please try again.";
    }
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
    <button id="inlineRegisterBtn">Sign up (extension)</button>
    <button id="openLogin">Log in on website</button>
    <p id="status" style="margin-top:8px; font-size:12px;"></p>
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

  // Option 3: open website login page (you can ignore this for now)
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
      <h3>Focus App</h3>
      <p id="userInfo" style="font-size:12px; margin-bottom:8px;"></p>
      <button id="startBtn">Start Session</button>
      <button id="endBtn">End Session</button>
      <button id="logoutBtn" style="margin-top: 10px;">Log out</button>
      <p id="sessionStatus"></p>
    `;
  
    const statusEl = document.getElementById("sessionStatus");
    const userInfoEl = document.getElementById("userInfo");
  
    // Load username from chrome.storage synced at login
    chrome.storage.sync.get(["username"], (res) => {
      if (res.username) {
        userInfoEl.textContent = `Logged in as ${res.username}`;
      } else {
        userInfoEl.textContent = "";
      }
    });
  
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
      await chrome.storage.sync.remove(["authToken", "username", "userUid"]);
      await disableBlocking();
      renderConnectScreen();
    });
  }  

// ---------- INIT ----------
async function init() {
  const { authToken } = await chrome.storage.sync.get("authToken");

  if (authToken) {
    // Either inline login OR register already saved a token
    renderSessionScreen();
  } else {
    // No token yet → show login/register choices
    renderConnectScreen();
  }
}

init();


