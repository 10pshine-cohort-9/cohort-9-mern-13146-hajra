import React, { useState, cloneElement } from "react";
import { useAuth } from "../context/authContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState('all');

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      {isAuthenticated && (
                <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          filter={filter}
          onFilterChange={setFilter}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {isAuthenticated && (
          <Navbar 
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {typeof children.type === 'string'
  ? children

  :cloneElement(children, { searchQuery, onSearchChange: setSearchQuery, filter, onFilterChange: setFilter })}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;