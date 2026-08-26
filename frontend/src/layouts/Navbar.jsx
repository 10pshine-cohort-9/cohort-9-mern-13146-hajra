import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Avatar resolver logic for Navbar
  const profilePicUrl = user?.profile_picture 
    ? (user.profile_picture.startsWith("http") ? user.profile_picture : `http://localhost:5000${user.profile_picture}`)
    : null;

  return (
    <header className="h-24 bg-[#F5F6FA] px-10 flex items-center justify-between border-b border-gray-200/60">
      <div className="relative w-96">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
          🔍
        </span>
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-12 pr-5 py-3 bg-white rounded-full border border-gray-200 text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C77C6]/20 focus:border-[#7C77C6] shadow-sm"
        />
      </div>

      {/* User Avatar & Greeting - Clickable to open Profile */}
      <div 
        onClick={() => navigate("/profile")}
        className="flex items-center gap-4 cursor-pointer p-2 rounded-2xl hover:bg-black/5 transition-all"
        title="Go to Profile"
      >
        <div className="flex items-center gap-4">
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt="Profile"
              className="w-11 h-11 rounded-full object-cover border-2 border-gray-300 shadow-sm"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#7C77C6]/20 flex items-center justify-center font-bold text-sm text-[#7C77C6]">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <span className="text-base font-medium text-gray-600">
             <strong className="text-gray-800 text-lg">{user?.name || "User"}</strong>
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;