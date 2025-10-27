export default function AssignmentRow({ data, onReassign, onDelete, onMessage }) {
  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="py-2 px-3">{data.customer_name}</td>
      <td className="py-2 px-3">{data.agent_username}</td>
      <td className="py-2 px-3 text-right space-x-2">
        <button onClick={onReassign} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm">Reassign</button>
        <button onClick={onMessage} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm">Message</button>
        <button onClick={onDelete} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">Delete</button>
      </td>
    </tr>
  );
}
