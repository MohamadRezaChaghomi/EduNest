// app/login/page.js
import LoginForm from '@/components/forms/LoginForm';

export const metadata = {
  title: 'ورود | EduNest',
  description: 'وارد حساب کاربری خود شوید',
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <LoginForm />
    </div>
  );
}