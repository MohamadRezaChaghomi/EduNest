// app/admin/logs/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ user: '', action: '', status: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.user) params.user = filters.user;
        if (filters.action) params.action = filters.action;
        if (filters.status) params.status = filters.status;
        const data = await api.admin.getLogs(params);
        if (isMounted.current) setLogs(data.data || (data.logs || []));
      } catch (err) {
        if (isMounted.current) toast.error(err.message || 'خطا در بارگذاری لاگ‌ها');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchLogs();
    return () => { isMounted.current = false; };
  }, [filters, refreshKey]);

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-foreground">گزارش فعالیت‌ها (لاگ)</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="شناسه کاربر یا ایمیل..."
          value={filters.user}
          onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          className="w-56"
        />
        <Input
          placeholder="نوع فعالیت (مانند LOGIN_SUCCESS)"
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className="w-56"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="SUCCESS">موفق</option>
          <option value="FAILED">ناموفق</option>
        </select>
        <Button variant="outline" onClick={() => setFilters({ user: '', action: '', status: '' })}>
          پاک کردن فیلترها
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>فعالیت</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>تاریخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center">هیچ لاگی یافت نشد</TableCell></TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{log.user?.name || 'سیستم'}</TableCell>
                  <TableCell className="font-mono text-sm">{log.action}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {log.status === 'SUCCESS' ? 'موفق' : 'ناموفق'}
                    </span>
                  </TableCell>
                  <TableCell>{log.ip || '-'}</TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleString('fa-IR')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}