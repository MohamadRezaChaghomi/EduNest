// app/reset-password/[token]/page.js
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

export const metadata = {
  title: 'بازیابی رمز عبور | EduNest',
  description: 'تنظیم رمز جدید',
};

export default function ResetPasswordPage({ params }) {
  const { token } = params;
  return (
    <div className="w-full max-w-md mx-auto">
      <ResetPasswordForm token={token} />
    </div>
  );
}