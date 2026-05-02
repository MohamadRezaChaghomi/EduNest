import VerifyOtpForm from '@/components/forms/VerifyOtpForm';

export const metadata = {
  title: 'Verify OTP | EduNest',
  description: 'Enter verification code',
};

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <VerifyOtpForm />
    </div>
  );
}