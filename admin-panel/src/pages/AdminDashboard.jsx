import { useState } from "react";
import AssignmentList from "../components/AssignmentList";
import UnassignedLeads from "../components/UnassignedLeads";
import { ApiClient } from "../api/ApiClient";

export default function AdminDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("assign");
  const [refreshKey, setRefreshKey] = useState(0);
  const currentUser = ApiClient.getCurrentUser();

  const handleAssignSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogoutClick = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - 1/4 of screen */}
      <div className="w-1/4 bg-white border-r shadow-lg flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>
            
            {/* User Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-800">
                {currentUser?.username || "Admin"}
              </p>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection("assign")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  activeSection === "assign"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Assign Chats
              </button>
              <button
                onClick={() => setActiveSection("assigned")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  activeSection === "assigned"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Assigned Chats
              </button>
            </nav>
          </div>

          {/* Logout Button - pushed to bottom */}
          <div className="mt-auto pt-6">
            <button
              onClick={handleLogoutClick}
              className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - 3/4 of screen */}
      <div className="w-3/4 p-6">
        {activeSection === "assign" ? (
          <UnassignedLeads onAssignSuccess={handleAssignSuccess} />
        ) : (
          <AssignmentList key={refreshKey} />
        )}
      </div>
    </div>
  );
}
