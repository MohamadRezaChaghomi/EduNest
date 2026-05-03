// app/admin/logs/page.js
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ userId: '', action: '' });

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.userId) params.userId = filters.userId;
        if (filters.action) params.action = filters.action;
        const data = await api.admin.getLogs(params);
        setLogs(data.logs);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [filters]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">گزارش فعالیت‌ها (لاگ)</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <Input placeholder="شناسه کاربر" value={filters.userId} onChange={(e) => setFilters({...filters, userId: e.target.value})} className="w-48" />
        <Input placeholder="نوع فعالیت" value={filters.action} onChange={(e) => setFilters({...filters, action: e.target.value})} className="w-48" />
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>کاربر</TableHead><TableHead>فعالیت</TableHead><TableHead>جزئیات</TableHead><TableHead>IP</TableHead><TableHead>تاریخ</TableHead></TableRow></TableHeader>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={5}>بارگذاری...</TableCell></TableRow> :
            logs.map(log => (
              <TableRow key={log._id}>
                <TableCell>{log.user?.name || 'سیستم'}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell className="max-w-md truncate">{log.details}</TableCell>
                <TableCell>{log.ip}</TableCell>
                <TableCell>{new Date(log.createdAt).toLocaleString('fa-IR')}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}