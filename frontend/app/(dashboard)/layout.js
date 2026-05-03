// app/dashboard/layout.js
'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // محاسبه مستقیم تب فعال از مسیر فعلی
  const getActiveTab = () => {
    if (pathname.includes('/dashboard/my-courses')) return 'my-courses';
    if (pathname.includes('/dashboard/profile')) return 'profile';
    if (pathname.includes('/dashboard/change-password')) return 'change-password';
    if (pathname.includes('/dashboard/tickets')) return 'tickets';
    return 'my-courses'; // پیش‌فرض
  };

  const activeTab = getActiveTab();

  const handleTabChange = (value) => {
    router.push(`/dashboard/${value}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">پنل کاربری</h1>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-courses">دوره‌های من</TabsTrigger>
          <TabsTrigger value="profile">پروفایل</TabsTrigger>
          <TabsTrigger value="change-password">تغییر رمز</TabsTrigger>
          <TabsTrigger value="tickets">تیکت‌ها</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
}