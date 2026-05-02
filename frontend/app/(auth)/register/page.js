import RegisterForm from '@/components/forms/RegisterForm';

export const metadata = {
  title: 'Register | EduNest',
  description: 'Create a new EduNest account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <RegisterForm />
    </div>
  );
}