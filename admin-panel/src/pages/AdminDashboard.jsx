import { useState } from "react";
import AssignmentList from "../components/AssignmentList";
import UnassignedLeads from "../components/UnassignedLeads";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("assign");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAssignSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - 1/4 of screen */}
      <div className="w-1/4 bg-white border-r shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection("assign")}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeSection === "assign"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Assign Leads
            </button>
            <button
              onClick={() => setActiveSection("assigned")}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeSection === "assigned"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Assigned Leads
            </button>
          </nav>
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
