import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password | EduNest',
  description: 'Create a new password',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <ResetPasswordForm />
    </div>
  );
}