import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password | EduNest',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <ForgotPasswordForm />
    </div>
  );
}