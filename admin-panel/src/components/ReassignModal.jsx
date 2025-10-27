import { useEffect, useState } from "react";
import { ApiClient } from "../api/ApiClient";

export default function ReassignModal({ data, onClose, onConfirm }) {
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    ApiClient.getAgents().then(setAgents);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4">Reassign Customer</h2>
        <p className="mb-2 text-gray-600">Customer: {data.customer_name}</p>

        <select
          className="border p-2 w-full rounded"
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select agent</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.username}
            </option>
          ))}
        </select>

        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
