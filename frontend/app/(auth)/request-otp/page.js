// app/request-otp/page.js
import RequestOtpForm from '@/components/forms/RequestOtpForm';

export const metadata = {
  title: 'درخواست کد تأیید | EduNest',
  description: 'دریافت کد تأیید از طریق پیامک',
};

export default function RequestOtpPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <RequestOtpForm />
    </div>
  );
}