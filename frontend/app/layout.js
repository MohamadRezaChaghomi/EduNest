// app/layout.js
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/cart/CartProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';

import './globals.css';

export const metadata = {
  title: 'EduNest | آموزش آنلاین',
  description: 'بزرگترین پلتفرم آموزش آنلاین با دوره‌های تخصصی',
  keywords: 'آموزش, دوره آنلاین, برنامه‌نویسی, طراحی وب',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="min-h-screen pt-20">{children}</main>
              <Footer />
              <Toaster position="top-center" richColors />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}