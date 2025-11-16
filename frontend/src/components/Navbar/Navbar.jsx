import React from "react";

export default function Navbar({ onNavigate }) {
  return (
    <nav className="w-full bg-surface/70 backdrop-blur-md border-b border-surfaceLight px-6 py-4 flex justify-between items-center">
      <button
        className="text-3xl font-bold text-textLight hover:text-textLight/80 transition"
        onClick={() => onNavigate && onNavigate("home")}
        type="button"
      >
        Dashboard
      </button>

      <div className="flex items-center gap-6 text-textLight/80">
        <button
          className="hover:text-textLight transition"
          onClick={() => onNavigate && onNavigate("profile")}
        >
          Profile
        </button>
        <button
          className="hover:text-textLight transition"
          onClick={() => onNavigate && onNavigate("settings")}
        >
          Settings
        </button>
        <button className="text-danger hover:text-danger/80 transition">Logout</button>
      </div>
    </nav>
  );
}
