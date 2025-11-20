import AdminGuard from '../../components/AdminGuard';

export default function AdminLogs() {
  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">System Logs</h1>
        <p className="text-gray-600">Activity logs – coming soon.</p>
        <p className="text-yellow-500 text-center mt-10">Logs feature pending backend integration</p>
      </div>
    </AdminGuard>
  );
}
