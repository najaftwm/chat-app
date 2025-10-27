import { useEffect, useState } from "react";
import { ApiClient } from "../api/ApiClient";

export default function AssignModal({ data, onClose, onConfirm }) {
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    ApiClient.getAgents().then(setAgents);
  }, []);

  const isReassign = data.agent_id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4">
          {isReassign ? "Reassign Agent" : "Assign Agent"}
        </h2>
        <p className="mb-2 text-gray-600">Customer: {data.username}</p>
        {isReassign && (
          <p className="mb-2 text-xs text-blue-600">
            Currently assigned to an agent
          </p>
        )}

        <select
          className="border p-2 w-full rounded"
          onChange={(e) => setSelected(e.target.value)}
          defaultValue=""
        >
          <option value="">Select agent</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.username}
            </option>
          ))}
        </select>

        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition">
            Cancel
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            className={`px-3 py-1 text-white rounded transition ${
              isReassign
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isReassign ? "Reassign" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}

