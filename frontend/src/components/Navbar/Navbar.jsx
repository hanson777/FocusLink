import { useState } from "react"; 

export default function Navbar() {
  return (
    <nav className="w-full bg-surface/70 backdrop-blur-md border-b border-surfaceLight px-6 py-4 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-textLight">
        Dashboard
      </h1>

      <div className="flex items-center gap-6 text-textLight/80">
        <button className="hover:text-textLight transition">Profile</button>
        <button className="hover:text-textLight transition">Settings</button>
        <button className="text-danger hover:text-danger/80 transition">Logout</button>
      </div>
    </nav>
  );
}