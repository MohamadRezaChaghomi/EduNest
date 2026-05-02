import LoginForm from '@/components/forms/LoginForm';

export const metadata = {
  title: 'Login | EduNest',
  description: 'Login to your account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <LoginForm />
    </div>
  );
}