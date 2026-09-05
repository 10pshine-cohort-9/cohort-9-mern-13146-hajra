import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FiLogOut, FiX } from "react-icons/fi";
import { RiLayoutLeftLine, RiLayoutRightLine } from "react-icons/ri";
import ProfileSection from '../components/common/ProfileSection';
import { getProfilePicUrl } from '../services/api';  

import PropTypes from 'prop-types';


const NAVIGATION_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: "📝" },
  { label: "Profile", path: "/profile", icon: "👤" },
];


const FILTER_ITEMS = [
  { label: "All Notes", value: "all", icon: "🗒️" },
  { label: "Pinned", value: "pinned", icon: "📌" },
  { label: "Archived", value: "archived", icon: "🗄️" },
];



const NavigationItems = ({ isCollapsed, onClose }) => (
  <div className="space-y-1.5">
    {!isCollapsed && (
      <p className="px-5 text-xs font-bold uppercase tracking-wider text-purple-200/70 mb-2">
        Menu
      </p>
    )}
    {NAVIGATION_ITEMS.map((item) => (
      <NavLink
        key={item.label}
        to={item.path}
        onClick={onClose}
        title={isCollapsed ? item.label : ""}
        className={({ isActive }) =>
          `flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-semibold transition-all ${
            isActive
              ? "bg-white/25 text-white shadow-inner"
              : "text-purple-100 hover:bg-white/10 hover:text-white"
          } ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`
        }
      >
        <span className="text-xl shrink-0">{item.icon}</span>
        <span className={`${isCollapsed ? "lg:hidden" : ""}`}>{item.label}</span>
      </NavLink>
    ))}
  </div>
);

NavigationItems.propTypes = {
  isCollapsed: PropTypes.bool,
  onClose: PropTypes.func,
};

const FilterItems = ({ filter, isCollapsed, onFilterChange, onClose }) => (
  <div className="space-y-1.5">
    {!isCollapsed && (
      <p className="px-5 text-xs font-bold uppercase tracking-wider text-purple-200/70 mb-2">
        Filters
      </p>
    )}
    {FILTER_ITEMS.map((item) => (
      <button
        type="button"
        key={item.value}
        onClick={() => { onFilterChange(item.value); onClose?.(); }}
        title={isCollapsed ? item.label : ""}
        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-semibold transition-all ${
          filter === item.value
            ? "bg-white/25 text-white shadow-inner"
            : "text-purple-100 hover:bg-white/10 hover:text-white"
        } ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}
      >
        <span className="text-xl shrink-0">{item.icon}</span>
        <span className={`${isCollapsed ? "lg:hidden" : ""}`}>{item.label}</span>
      </button>
    ))}
  </div>
);

FilterItems.propTypes = {
  filter: PropTypes.oneOf(['all', 'pinned', 'archived']),
  isCollapsed: PropTypes.bool,
  onFilterChange: PropTypes.func,
  onClose: PropTypes.func,
};


function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse, filter, onFilterChange }) {
      const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profilePicUrl = getProfilePicUrl(user);

  return (
    <>
     {isOpen && (
    <button
        type="button"
        onClick={onClose}
        aria-label="Close sidebar overlay"
        className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
    />
)}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-[#7C77C6] min-h-screen flex flex-col justify-between py-8 text-white select-none shrink-0
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0 w-72 sm:w-80 px-5 sm:px-6" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20 lg:px-4" : "lg:w-[22rem] lg:px-6"}
        `}
      >
        <div>
          <div className="flex items-center gap-20 justify-between mb-12">
          

            <div className={`flex items-center gap-3 overflow-hidden flex-1 justify-end lg:justify-start ${isCollapsed ? "lg:hidden" : ""}`}>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg shrink-0">
                N
              </div>
              <span className="font-bold text-xl tracking-wide text-white truncate">
                NotesApp
              </span>
            </div>

            <button
            type="button" 
              onClick={onToggleCollapse}
              className="hidden lg:flex text-white hover:bg-white/10 p-2.5 rounded-xl transition-colors shrink-0"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <RiLayoutRightLine className="text-3xl" />
              ) : (
                <RiLayoutLeftLine className="text-3xl" />
              )}
            </button>

            <button 
             type="button"
              onClick={onClose}
              className="lg:hidden text-white hover:bg-white/10 p-2.5 rounded-xl transition-colors shrink-0"
              aria-label="Close sidebar"
            >
              <FiX className="text-2xl" />
            </button>
          </div>

              <nav className="space-y-6">
  <NavigationItems isCollapsed={isCollapsed} onClose={onClose} />
  <FilterItems 
    filter={filter} 
    isCollapsed={isCollapsed} 
    onFilterChange={onFilterChange} 
    onClose={onClose} 
  />
</nav>
        </div>

        <div className="pt-6 border-t border-purple-400/30">
        <ProfileSection
  user={user}
  profilePicUrl={profilePicUrl}
  isCollapsed={isCollapsed}
  variant="sidebar"
  onClick={() => { navigate("/profile"); onClose?.(); }}
/>

          <button
            onClick={handleLogout}
            type="button"
            title={isCollapsed ? "Logout" : ""}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-purple-100 hover:bg-rose-500/80 hover:text-white transition-colors ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}
          >
            <FiLogOut className="text-xl shrink-0" />
            <span className={`text-lg ${isCollapsed ? "lg:hidden" : ""}`}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  filter: PropTypes.oneOf(['all', 'pinned', 'archived']),
  onFilterChange: PropTypes.func,
};

export default Sidebar;