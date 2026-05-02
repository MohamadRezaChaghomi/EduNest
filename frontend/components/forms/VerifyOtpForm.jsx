'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function VerifyOtpForm() {
  const [code, setCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { verifyOtp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedPhone = sessionStorage.getItem('otpPhone');
    if (storedPhone) {
      setPhone(storedPhone);
    } else {
      router.push('/request-otp');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(phone, code, rememberMe);
      toast.success('Logged in successfully');
      sessionStorage.removeItem('otpPhone');
      router.push('/profile');
    } catch (err) {
      toast.error(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return null; // یا یک اسپینر لودینگ
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Verify Code</CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit code sent to {phone}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
              Remember me
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Verifying...' : 'Verify & Login'}
          </Button>
          <div className="text-sm text-center">
            <Link href="/request-otp" className="text-primary hover:underline">
              Request new code
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}