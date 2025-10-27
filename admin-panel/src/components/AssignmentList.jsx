import { useEffect, useState } from "react";
import { ApiClient } from "../api/ApiClient";
import AssignmentRow from "./AssignmentRow";
import ReassignModal from "./ReassignModal";
import MessagesModal from "./MessagesModal";

export default function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reassignData, setReassignData] = useState(null);
  const [messageData, setMessageData] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    setLoading(true);
    const data = await ApiClient.getAssignments();
    setAssignments(data);
    setLoading(false);
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">Assigned Chats</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : assignments.length === 0 ? (
        <p className="text-gray-500 text-sm">No assigned customers yet</p>
      ) : (
        <table className="w-full text-left">
          <thead className="border-b">
            <tr>
              <th className="py-2 px-3">Customer</th>
              <th className="py-2 px-3">Agent</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <AssignmentRow
                key={a.id}
                data={a}
                onReassign={() => setReassignData(a)}
                onDelete={async () => {
                  await ApiClient.deleteAssignment(a.id);
                  loadAssignments();
                }}
                onMessage={() => setMessageData(a)}
              />
            ))}
          </tbody>
        </table>
      )}

      {reassignData && (
        <ReassignModal
          data={reassignData}
          onClose={() => setReassignData(null)}
          onConfirm={async (agentId) => {
            await ApiClient.reassign(reassignData.id, agentId, reassignData.customer_id);
            setReassignData(null);
            loadAssignments();
          }}
        />
      )}

      {messageData && (
        <MessagesModal
          data={messageData}
          onClose={() => setMessageData(null)}
        />
      )}
    </div>
  );
}
