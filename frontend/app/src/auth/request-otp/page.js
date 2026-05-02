import RequestOtpForm from '@/components/forms/RequestOtpForm';

export const metadata = {
  title: 'Request OTP | EduNest',
  description: 'Get verification code via SMS',
};

export default function RequestOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <RequestOtpForm />
    </div>
  );
}