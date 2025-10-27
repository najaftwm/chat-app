import { useEffect, useState } from "react";
import { ApiClient } from "../api/ApiClient";
import AssignModal from "./AssignModal";

export default function UnassignedLeads({ onAssignSuccess }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignData, setAssignData] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    const data = await ApiClient.getCustomers();
    // Show all customers from the customers table
    setCustomers(data);
    setLoading(false);
  }

  return (
    <>
      <div className="bg-white shadow-md rounded-xl p-4">
        <h2 className="text-xl font-bold mb-4">Assign chats</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : customers.length === 0 ? (
          <p className="text-gray-500 text-sm">No customers found</p>
        ) : (
          <div className="space-y-2">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="font-medium">{customer.username}</div>
                  <div className="text-xs text-gray-500">
                    Customer #{customer.id}
                    {customer.agent_id && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        Already Assigned
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setAssignData(customer)}
                  className={`px-3 py-1 rounded-md text-sm transition ${
                    customer.agent_id
                      ? "bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
                      : "bg-red-500 hover:bg-red-600 cursor-pointer text-white"
                  }`}
                >
                  {customer.agent_id ? "Reassign" : "Assign"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {assignData && (
        <AssignModal
          data={assignData}
          onClose={() => setAssignData(null)}
          onConfirm={async (agentId) => {
            await ApiClient.assignAgent(assignData.id, agentId);
            setAssignData(null);
            loadCustomers();
            if (onAssignSuccess) onAssignSuccess();
          }}
        />
      )}
    </>
  );
}

