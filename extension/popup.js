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
        // ---- FAKE BACKEND CALL ----
        // Later: replace this with a real fetch() to your API.
        // e.g. const res = await fetch("https://api.yourapp.com/login", { ... })
        //      const data = await res.json();
        //      const token = data.token;
        const fakeToken = "dev-token-for-" + email;
  
        // Save token for later use
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
      statusEl.textContent = "Session started!";
    });
  
    document.getElementById("endBtn").addEventListener("click", async () => {
      await chrome.storage.sync.set({ sessionActive: false });
      statusEl.textContent = "Session ended.";
    });
  
    // Clear authToken so next time popup opens it shows login again
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await chrome.storage.sync.remove("authToken");
      renderLoginScreen();
    });
  }
  
  // ---------- INIT ----------
  async function init() {
    const { authToken } = await chrome.storage.sync.get("authToken");
  
    if (authToken) {
      // already logged in → go straight to Start/End
      renderSessionScreen();
    } else {
      // first time / logged out → show login screen
      renderLoginScreen();
    }
  }
  
  init();