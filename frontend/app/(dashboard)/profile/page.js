'use client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login. <a href="/login">Go to login</a></div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <Button onClick={logout} className="mt-4">Logout</Button>
    </div>
  );
}