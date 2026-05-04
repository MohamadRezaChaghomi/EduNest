// app/forgot-password/page.js
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

export const metadata = {
  title: 'فراموشی رمز عبور | EduNest',
  description: 'بازیابی رمز عبور',
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <ForgotPasswordForm />
    </div>
  );
}