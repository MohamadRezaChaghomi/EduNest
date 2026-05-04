// app/verify-otp/page.js
import VerifyOtpForm from '@/components/forms/VerifyOtpForm';

export const metadata = {
  title: 'تأیید کد | EduNest',
  description: 'ورود با کد تأیید',
};

export default function VerifyOtpPage() {
  return (
    <div className="w-full max-w-md">
      <VerifyOtpForm />
    </div>
  );
}