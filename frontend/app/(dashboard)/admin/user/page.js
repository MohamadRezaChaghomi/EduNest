import UserTable from '@/components/Admin/UserTable';

export const metadata = {
  title: 'Manage Users | EduNest Admin',
  description: 'View, ban, and manage users',
};

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UserTable />
    </div>
  );
}