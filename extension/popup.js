const API_BASE = "https://undelved-censorable-ethan.ngrok-free.dev";

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
        <button id="startBtn">Start Session</button>
        <button id="endBtn">End Session</button>
        <button id="logoutBtn" style="margin-top: 10px;">Log out</button>
        <p id="sessionStatus" style="font-size:12px; margin-top:8px;"></p>
      </div>
    `;
  
    const statusEl = document.getElementById("sessionStatus");
    const userInfoEl = document.getElementById("userInfo");
  
    // Load username from chrome.storage synced at login / website
    chrome.storage.sync.get(["username"], (res) => {
      if (res.username) {
        userInfoEl.textContent = `Logged in as ${res.username}`;
      } else {
        userInfoEl.textContent = "";
      }
    });
  
    document.getElementById("startBtn").addEventListener("click", async () => {
      statusEl.textContent = "Starting focus session...";
      try {
        // Example payload – adjust fields to match your backend
        await startTimerSession({ duration_minutes: 25 });
        await chrome.storage.sync.set({ sessionActive: true });
        await enableBlocking();
        statusEl.textContent =
          "Focus mode ON. Instagram, YouTube & Netflix have been yeeted 🚫";
      } catch (err) {
        statusEl.textContent = "Failed to start session. Please try again.";
      }
    });
  
    document.getElementById("endBtn").addEventListener("click", async () => {
      await chrome.storage.sync.set({ sessionActive: false });
      await disableBlocking();
      statusEl.textContent = "Session ended. The fun apps are free again 🎉";
    });
  
    document.getElementById("logoutBtn").addEventListener("click", () => {
        const keysToRemove = ["authToken", "username", "userUid", "sessionActive"];
      
        chrome.storage.sync.remove(keysToRemove, () => {
          if (chrome.runtime.lastError) {
            console.error("Failed to remove keys:", chrome.runtime.lastError);
          } else {
            console.log("Removed auth/session keys from chrome.storage.sync");
          }
      
          // Turn off blocking just in case
          try {
            disableBlocking();
          } catch (e) {
            console.error("disableBlocking failed (probably fine in popup):", e);
          }
      
          // Go back to the connect screen
          renderConnectScreen();
        });
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
  