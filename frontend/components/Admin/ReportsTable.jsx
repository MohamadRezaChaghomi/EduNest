'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAsyncEffect } from '@/hooks/useAsyncEffect';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ReportsTable() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useAsyncEffect(async (isMounted) => {
    setLoading(true);
    try {
      const data = await api.admin.getReports({ status: 'pending' });
      if (isMounted.current) {
        setReports(data.data);
      }
    } catch (err) {
      if (isMounted.current) {
        toast.error('خطا در بارگذاری گزارش‌ها');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleResolve = async (reportId, action) => {
    try {
      await api.admin.resolveReport(reportId, { action, adminNote: '' });
      toast.success(action === 'delete' ? 'نظر حذف و گزارش بسته شد' : 'گزارش رد شد');
      // Refetch using the same logic – we'll just call the API again, but to avoid duplication, we can re-run the effect by using a state trigger.
      // For simplicity, we'll create a separate fetch function. Or we can use a key. Let's do a refetch function.
      const data = await api.admin.getReports({ status: 'pending' });
      setReports(data.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-xl font-semibold">گزارش‌های تخلف (در انتظار)</h2>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>گزارش‌دهنده</TableHead>
              <TableHead>نظر مربوطه</TableHead>
              <TableHead>دلیل</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : reports.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center">هیچ گزارشی یافت نشد</TableCell></TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>{report.reporter?.name}</TableCell>
                  <TableCell className="max-w-md truncate">{report.review?.comment}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{report.status === 'pending' ? 'در انتظار' : 'حل شده'}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleResolve(report._id, 'delete')}>
                      حذف نظر و بستن گزارش
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleResolve(report._id, 'reject')}>
                      رد گزارش
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}