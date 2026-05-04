'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body className="bg-background text-foreground flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-4xl font-bold text-destructive">خطای غیرمنتظره</h1>
          <p className="text-muted-foreground">{error.message || 'مشکلی پیش آمده است.'}</p>
          <Button onClick={() => reset()} variant="default">
            تلاش مجدد
          </Button>
        </div>
      </body>
    </html>
  );
}