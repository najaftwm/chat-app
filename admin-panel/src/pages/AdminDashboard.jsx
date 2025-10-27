import AssignmentList from "../components/AssignmentList";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Panel</h1>
      <AssignmentList />
    </div>
  );
}
