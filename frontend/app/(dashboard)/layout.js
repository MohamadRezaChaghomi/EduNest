// app/dashboard/layout.js
'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname.includes('/dashboard/my-courses')) return 'my-courses';
    if (pathname.includes('/dashboard/profile')) return 'profile';
    if (pathname.includes('/dashboard/change-password')) return 'change-password';
    if (pathname.includes('/dashboard/tickets')) return 'tickets';
    return 'my-courses';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (value) => {
    router.push(`/dashboard/${value}`);
  };

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-foreground">پنل کاربری</h1>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="my-courses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            دوره‌های من
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            پروفایل
          </TabsTrigger>
          <TabsTrigger value="change-password" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            تغییر رمز
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            تیکت‌ها
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
}