import LogTable from '@/components/Admin/LogTable';

export const metadata = {
  title: 'Audit Logs | EduNest Admin',
  description: 'View system activity logs',
};

export default function AdminLogsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <LogTable />
    </div>
  );
}