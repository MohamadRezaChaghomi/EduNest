// app/admin/reports/page.js
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await api.admin.getReports({ status: 'pending' });
        setReports(data.reports);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleResolve = async (reportId, action) => { // action: 'delete' or 'reject'
    try {
      await api.admin.resolveReport(reportId, { action });
      toast.success(action === 'delete' ? 'نظر حذف و گزارش بسته شد' : 'گزارش رد شد');
      setReports(prev => prev.filter(r => r._id !== reportId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">گزارش‌های نظرات</h1>
      <Table>
        <TableHeader><TableRow><TableHead>گزارش‌دهنده</TableHead><TableHead>نظر</TableHead><TableHead>دلیل</TableHead><TableHead>وضعیت</TableHead><TableHead>عملیات</TableHead></TableRow></TableHeader>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={5}>بارگذاری...</TableCell></TableRow> :
            reports.map(report => (
              <TableRow key={report._id}>
                <TableCell>{report.reporter?.name}</TableCell>
                <TableCell>{report.review?.comment}</TableCell>
                <TableCell>{report.reason}</TableCell>
                <TableCell><Badge variant="outline">در انتظار</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleResolve(report._id, 'delete')}><CheckCircle className="w-4 h-4 text-green-600" /> حذف نظر</Button>
                    <Button size="sm" variant="outline" onClick={() => handleResolve(report._id, 'reject')}><XCircle className="w-4 h-4 text-red-500" /> رد گزارش</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}