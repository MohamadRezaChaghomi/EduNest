// app/admin/reports/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await api.admin.getReports({ status: 'pending' });
        if (isMounted.current) setReports(data.data || (data.reports || []));
      } catch (err) {
        if (isMounted.current) toast.error(err.message || 'خطا در بارگذاری گزارش‌ها');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchReports();
    return () => { isMounted.current = false; };
  }, [refreshKey]);

  const handleResolve = async (reportId, action) => {
    try {
      await api.admin.resolveReport(reportId, { action, adminNote: '' });
      toast.success(action === 'delete' ? 'نظر حذف و گزارش بسته شد' : 'گزارش رد شد');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      toast.error(err.message || 'خطا در حل گزارش');
    }
  };

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-foreground">گزارش‌های تخلف</h1>
      <div className="border rounded-lg overflow-hidden">
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
              <TableRow><TableCell colSpan={5} className="text-center">هیچ گزارش جدیدی یافت نشد</TableCell></TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>{report.reporter?.name}</TableCell>
                  <TableCell className="max-w-md truncate">{report.review?.comment}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell><Badge variant="secondary">در انتظار</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleResolve(report._id, 'delete')}>
                        <CheckCircle className="w-4 h-4 text-green-600" /> حذف نظر
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResolve(report._id, 'reject')}>
                        <XCircle className="w-4 h-4 text-destructive" /> رد گزارش
                      </Button>
                    </div>
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