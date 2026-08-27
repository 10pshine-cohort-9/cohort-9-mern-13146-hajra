import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      {/* Soft Purple Sidebar for Authenticated Views */}
      {isAuthenticated && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        {isAuthenticated && <Navbar />}

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;