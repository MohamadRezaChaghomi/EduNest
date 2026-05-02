'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function RequestOtpForm() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestOtp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp(phone);
      toast.success('Verification code sent to your phone');
      // store phone in sessionStorage to use in verify page
      sessionStorage.setItem('otpPhone', phone);
      router.push('/verify-otp');
    } catch (err) {
      toast.error(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login with OTP</CardTitle>
        <CardDescription className="text-center">
          Enter your phone number to receive a verification code
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="09123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send verification code'}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            {"Back to "}
            <Link href="/login" className="text-primary hover:underline">
              Login with password
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}