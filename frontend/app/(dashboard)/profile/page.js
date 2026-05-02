'use client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Please login. <a href="/login" className="text-blue-600 underline">Go to login</a></div>;

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4">
        {JSON.stringify(user, null, 2)}
      </pre>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}