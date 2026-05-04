// app/admin/page.js
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersTable from '@/components/admin/UserTable';
import CoursesTable from '@/components/admin/CoursesTable';
import ReviewsTable from '@/components/admin/ReviewsTable';
import ReportsTable from '@/components/admin/ReportsTable';
import TicketsTable from '@/components/admin/TicketsTable';
import LogTable from '@/components/admin/LogTable';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-foreground">پنل مدیریت</h1>
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 bg-muted/50">
          <TabsTrigger value="users">کاربران</TabsTrigger>
          <TabsTrigger value="courses">دوره‌ها</TabsTrigger>
          <TabsTrigger value="reviews">نظرات</TabsTrigger>
          <TabsTrigger value="reports">گزارش‌ها</TabsTrigger>
          <TabsTrigger value="tickets">تیکت‌ها</TabsTrigger>
          <TabsTrigger value="logs">لاگ‌ها</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><UsersTable /></TabsContent>
        <TabsContent value="courses"><CoursesTable /></TabsContent>
        <TabsContent value="reviews"><ReviewsTable /></TabsContent>
        <TabsContent value="reports"><ReportsTable /></TabsContent>
        <TabsContent value="tickets"><TicketsTable /></TabsContent>
        <TabsContent value="logs"><LogTable /></TabsContent>
      </Tabs>
    </div>
  );
}