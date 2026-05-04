// app/not-found.js
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-9xl font-bold text-primary">۴۰۴</h1>
        <h2 className="text-3xl font-semibold text-foreground">صفحه مورد نظر یافت نشد</h2>
        <p className="text-muted-foreground max-w-md">
          متأسفیم، صفحه‌ای که به دنبال آن هستید وجود ندارد یا جابه‌جا شده است.
        </p>
        <Button asChild>
          <Link href="/">بازگشت به صفحه اصلی</Link>
        </Button>
      </div>
    </div>
  );
}