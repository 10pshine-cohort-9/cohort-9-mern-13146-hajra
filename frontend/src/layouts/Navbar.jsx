import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FiMenu, FiSearch } from "react-icons/fi";
import PropTypes from 'prop-types';
import ProfileSection from '../components/common/ProfileSection';

import { getProfilePicUrl } from '../services/api';




function Navbar({ onToggleSidebar, searchQuery, onSearchChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();



const profilePicUrl = getProfilePicUrl(user);


  return (
    <header className="bg-[#F5F6FA] px-4 lg:px-10 py-3 lg:h-24 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-200/60 shadow-xs">
      
  
      <div className="hidden lg:block shrink-0">
        <h1 className="text-3xl font-extrabold text-[#7570b8] tracking-wide whitespace-nowrap">
          NotesApp
        </h1>
        <p className="text-sm text-[#7570b8] mt-2">
          Your digital notebook for everything.
        </p>
      </div>

      <div className="hidden lg:block flex-1 max-w-xl mx-auto">
        <div className="relative w-full">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 text-xl" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes here..."
            className="w-full rounded-xl pl-10 pr-4 py-3 text-lg bg-gray-50/50 focus:bg-white border-2 border-[#7C77C6] focus:outline-none focus:ring-2 focus:ring-[#7C77C6]/20 transition-all"
          />
        </div>
      </div>

      <div className="hidden lg:flex items-center shrink-0 text-xl">
        <ProfileSection
  profilePicUrl={profilePicUrl}
  user={user}
  onClick={() => navigate("/profile")}
/>
      </div>


  
      <div className="flex lg:hidden items-center justify-between w-full">
      <button
  type="button"
  onClick={onToggleSidebar}
  className="text-gray-700 hover:bg-black/5 p-2 rounded-xl transition-colors focus:outline-none"
  aria-label="Toggle Sidebar"
>
          <FiMenu className="text-2xl" />
        </button>

        <h1 className="text-xl font-bold text-[#7570b8] tracking-wide">
          NotesApp
        </h1>

<ProfileSection
  profilePicUrl={profilePicUrl}
  user={user}
  onClick={() => navigate("/profile")}
/>
      </div>

      <div className="flex lg:hidden items-center w-full">
        <div className="relative w-full max-w-[280px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-lg" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full rounded-xl pl-9 pr-3 py-2 text-sm bg-gray-50/50 focus:bg-white border-2 border-[#7C77C6] focus:outline-none focus:ring-2 focus:ring-[#7C77C6]/20 transition-all"
          />
        </div>
      </div>

    </header>
  );
}

ProfileSection.propTypes = {
  profilePicUrl: PropTypes.string,
  user: PropTypes.shape({ name: PropTypes.string }),
  onClick: PropTypes.func.isRequired,
};

Navbar.propTypes = {
  onToggleSidebar: PropTypes.func,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
};
export default Navbar;