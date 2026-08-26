import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FiLogOut } from "react-icons/fi";

const NAVIGATION_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: "📝" },
  { label: "Profile", path: "/profile", icon: "👤" },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profilePicUrl = user?.profile_picture 
    ? (user.profile_picture.startsWith("http") ? user.profile_picture : `http://localhost:5000${user.profile_picture}`)
    : null;

  return (
    <aside className="w-80 bg-[#7C77C6] min-h-screen flex flex-col justify-between p-8 text-white select-none shrink-0">
      <div>
        <div className="flex items-center gap-3 mb-12 pl-2">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
            N
          </div>
          <span className="font-bold text-2xl tracking-wide text-white">
            NotesApp
          </span>
        </div>

        <nav className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-semibold transition-all ${
                  isActive
                    ? "bg-white/25 text-white shadow-inner"
                    : "text-purple-100 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="pt-6 border-t border-purple-400/30 pl-2">
        <div 
          onClick={() => navigate("/profile")}
          className="flex items-center gap-4 mb-4 cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-all group"
          title="Go to Profile"
        >
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt="Profile"
              className="w-11 h-11 rounded-full object-cover border-2 border-white/40 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-white/30 flex items-center justify-center font-bold text-base text-white shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="truncate">
            <p className="text-base font-bold text-white truncate group-hover:underline">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-purple-200 truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-purple-100 hover:bg-rose-500/80 hover:text-white transition-colors"
        >
          <FiLogOut className="text-lg" />
          <span className="text-lg">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;