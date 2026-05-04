// app/register/page.js
import RegisterForm from '@/components/forms/RegisterForm';

export const metadata = {
  title: 'ثبت‌نام | EduNest',
  description: 'ایجاد حساب جدید',
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <RegisterForm />
    </div>
  );
}