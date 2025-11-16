import { useState } from "react";
import api from "../api";

const EXTENSION_ID = "afiiiddabldcinjejkijhfhpgomiohjk"; 


export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.login(loginData.username, loginData.password);
      
      // Call onLogin callback to update parent state
      if (onLogin) {
        onLogin(response.access_token, response.user);
      }
      if (window.chrome?.runtime?.sendMessage) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            type: "focusapp-auth",
            token: response.access_token,
            username: response.user.username,
            uid: response.user.uid,
          },
          (res) => {
            console.log("Extension response:", res);
          }
        );
      } else {
        console.warn("Chrome extension messaging not available");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message.includes("401") || err.message.includes("Incorrect")
          ? "Incorrect username or password"
          : "Failed to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.register(registerData);
      
      // Registration successful - switch to login mode
      setError(null);
      setMode("login");
      setLoginData({
        username: registerData.username,
        password: "",
      });
      // Show success message
      setError("Account created! Please log in.");
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Register error:", err);
      // Handle validation errors
      if (err.message.includes("422") || err.message.includes("detail")) {
        try {
          const errorData = JSON.parse(err.message.match(/\{.*\}/)?.[0] || "{}");
          if (errorData.detail && Array.isArray(errorData.detail)) {
            setError(errorData.detail.map((d) => d.msg).join(", "));
          } else if (errorData.detail) {
            setError(errorData.detail);
          } else {
            setError("Validation error. Please check your input.");
          }
        } catch {
          setError(err.message.includes("400") || err.message.includes("already")
            ? err.message.match(/"detail":\s*"([^"]+)"/)?.[1] || "Username or email already registered"
            : "Failed to register. Please try again.");
        }
      } else {
        setError("Failed to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-3xl font-bold text-textLight mb-2 text-center">
            Focus Link
          </h1>
          <p className="text-textLight/60 text-center mb-6">
            {mode === "login"
              ? "Log in to start your focus session"
              : "Create a new account"}
          </p>

          {error && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                error.includes("created") || error.includes("success")
                  ? "bg-success/20 text-success border border-success/30"
                  : "bg-danger/20 text-danger border border-danger/30"
              }`}
            >
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textLight mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) =>
                    setLoginData({ ...loginData, username: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-surfaceLight border border-surface rounded-lg text-textLight focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textLight mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-surfaceLight border border-surface rounded-lg text-textLight focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textLight mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={registerData.username}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, username: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-surfaceLight border border-surface rounded-lg text-textLight focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textLight mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-surfaceLight border border-surface rounded-lg text-textLight focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textLight mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={registerData.first_name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, first_name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-surfaceLight border border-surface rounded-lg text-textLight focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textLight mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={registerData.last_name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, last_name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-surfaceLight border border-surface rounded-lg text-textLight focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textLight mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                  required
                  minLength={8}
                  className="w-full px-4 py-2 bg-surfaceLight border border-surface rounded-lg text-textLight focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="At least 8 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              className="text-primary hover:text-primaryLight transition text-sm"
            >
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

