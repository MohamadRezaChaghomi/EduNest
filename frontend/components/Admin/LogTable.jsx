'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LogTable() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ action: '', user: '', status: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.admin.getLogs({
          page: pagination.page,
          limit: 20,
          action: filters.action,
          user: filters.user,
          status: filters.status,
        });
        setLogs(res.data);
        setPagination(res.pagination);
      } catch (err) {
        toast.error('خطا در بارگذاری لاگ‌ها');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [pagination.page, filters]);

  const formatDate = (dateString) => new Date(dateString).toLocaleString('fa-IR');

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="شناسه کاربر یا ایمیل..."
            value={filters.user}
            onChange={(e) => setFilters({ ...filters, user: e.target.value, page: 1 })}
            className="w-full"
          />
        </div>
        <div className="w-48">
          <Select value={filters.action} onValueChange={(val) => setFilters({ ...filters, action: val, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="همه اقدامات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">همه</SelectItem>
              <SelectItem value="LOGIN_SUCCESS">ورود موفق</SelectItem>
              <SelectItem value="LOGIN_FAILED">ورود ناموفق</SelectItem>
              <SelectItem value="REGISTER">ثبت‌نام</SelectItem>
              <SelectItem value="CHANGE_PASSWORD">تغییر رمز</SelectItem>
              <SelectItem value="USER_BANNED">مسدود کردن کاربر</SelectItem>
              <SelectItem value="USER_UNBANNED">رفع مسدودیت</SelectItem>
              <SelectItem value="USER_DELETED">حذف کاربر</SelectItem>
              <SelectItem value="ROLE_CHANGE">تغییر نقش</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-36">
          <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="همه وضعیت‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">همه</SelectItem>
              <SelectItem value="SUCCESS">موفق</SelectItem>
              <SelectItem value="FAILED">ناموفق</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => setFilters({ action: '', user: '', status: '' })}>
          پاک کردن فیلترها
        </Button>
      </div>

      {/* Logs Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>اقدام</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>مرورگر</TableHead>
              <TableHead>زمان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">هیچ لاگی یافت نشد</TableCell></TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{log.user ? `${log.user.name} (${log.user.email})` : 'ناشناس'}</TableCell>
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
                  <TableCell className="max-w-[200px] truncate" title={log.userAgent}>{log.userAgent || '-'}</TableCell>
                  <TableCell>{formatDate(log.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button variant="outline" disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>
            قبلی
          </Button>
          <span className="text-sm">صفحه {pagination.page} از {pagination.pages}</span>
          <Button variant="outline" disabled={pagination.page === pagination.pages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>
            بعدی
          </Button>
        </div>
      )}
    </div>
  );
}