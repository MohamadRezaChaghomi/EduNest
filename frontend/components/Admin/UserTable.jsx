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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ role: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [banDialog, setBanDialog] = useState({ open: false, userId: null, reason: '', expiresAt: '' });
  const [roleDialog, setRoleDialog] = useState({ open: false, userId: null, newRole: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.admin.getUsers({ page: pagination.page, limit: 10, ...filters });
        setUsers(res.data);
        setPagination(res.pagination);
      } catch (err) {
        toast.error('خطا در بارگذاری کاربران');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [pagination.page, filters]);

  const handleBan = async () => {
    if (!banDialog.userId) return;
    try {
      await api.admin.banUser(banDialog.userId, {
        reason: banDialog.reason,
        expiresAt: banDialog.expiresAt || null,
      });
      toast.success('کاربر مسدود شد');
      setBanDialog({ open: false, userId: null, reason: '', expiresAt: '' });
      setPagination(prev => ({ ...prev, page: prev.page })); // re-fetch
    } catch (err) {
      toast.error(err.message || 'خطا در مسدودسازی');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await api.admin.unbanUser(userId);
      toast.success('مسدودیت کاربر برداشته شد');
      setPagination(prev => ({ ...prev, page: prev.page }));
    } catch (err) {
      toast.error(err.message || 'خطا در رفع مسدودیت');
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('آیا از حذف این کاربر مطمئن هستید؟ این عمل غیرقابل بازگشت است.')) {
      try {
        await api.admin.deleteUser(userId);
        toast.success('کاربر حذف شد');
        setPagination(prev => ({ ...prev, page: prev.page }));
      } catch (err) {
        toast.error(err.message || 'خطا در حذف کاربر');
      }
    }
  };

  const openRoleDialog = (userId, currentRole) => {
    setRoleDialog({ open: true, userId, newRole: currentRole });
  };

  const handleRoleChange = async () => {
    try {
      await api.admin.changeRole(roleDialog.userId, roleDialog.newRole);
      toast.success('نقش کاربر به‌روز شد');
      setRoleDialog({ open: false, userId: null, newRole: '' });
      setPagination(prev => ({ ...prev, page: prev.page }));
    } catch (err) {
      toast.error(err.message || 'خطا در تغییر نقش');
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* فیلترها */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="جستجو بر اساس نام، ایمیل یا تلفن..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="w-full"
          />
        </div>
        <div className="w-40">
          <Select
            value={filters.role}
            onValueChange={(val) => setFilters({ ...filters, role: val, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="همه نقش‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">همه</SelectItem>
              <SelectItem value="user">کاربر عادی</SelectItem>
              <SelectItem value="instructor">مدرس</SelectItem>
              <SelectItem value="admin">مدیر</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => setFilters({ role: '', search: '' })}>
          پاک کردن فیلترها
        </Button>
      </div>

      {/* جدول کاربران */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>ایمیل</TableHead>
              <TableHead>تلفن</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">کاربری یافت نشد</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openRoleDialog(user._id, user.role)}>
                      {user.role === 'admin' ? 'مدیر' : user.role === 'instructor' ? 'مدرس' : 'کاربر'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <span className="text-red-600 font-medium">مسدود</span>
                    ) : (
                      <span className="text-green-600 font-medium">فعال</span>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {!user.isBanned ? (
                      <Button variant="destructive" size="sm" onClick={() => setBanDialog({ open: true, userId: user._id, reason: '', expiresAt: '' })}>
                        مسدود
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleUnban(user._id)}>
                        رفع مسدودیت
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user._id)}>
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* صفحه‌بندی */}
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

      {/* دیالوگ مسدودسازی */}
      <Dialog open={banDialog.open} onOpenChange={(open) => !open && setBanDialog({ open: false, userId: null, reason: '', expiresAt: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>مسدود کردن کاربر</DialogTitle>
            <DialogDescription>دلیل مسدودیت و تاریخ انقضای اختیاری را وارد کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">دلیل</Label>
              <Input id="reason" value={banDialog.reason} onChange={(e) => setBanDialog({ ...banDialog, reason: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">تاریخ انقضا (اختیاری)</Label>
              <Input id="expiresAt" type="datetime-local" value={banDialog.expiresAt} onChange={(e) => setBanDialog({ ...banDialog, expiresAt: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialog({ open: false, userId: null, reason: '', expiresAt: '' })}>انصراف</Button>
            <Button variant="destructive" onClick={handleBan}>مسدود کردن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* دیالوگ تغییر نقش */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => !open && setRoleDialog({ open: false, userId: null, newRole: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغییر نقش کاربر</DialogTitle>
            <DialogDescription>نقش جدید را انتخاب کنید.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={roleDialog.newRole} onValueChange={(val) => setRoleDialog({ ...roleDialog, newRole: val })}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب نقش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">کاربر عادی</SelectItem>
                <SelectItem value="instructor">مدرس</SelectItem>
                <SelectItem value="admin">مدیر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog({ open: false, userId: null, newRole: '' })}>انصراف</Button>
            <Button onClick={handleRoleChange}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}