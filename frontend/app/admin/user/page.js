// app/admin/users/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Ban, Trash2, Shield } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', role: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const isMounted = useRef(true);

  // Fetch users
  useEffect(() => {
    isMounted.current = true;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.role) params.role = filters.role;
        const data = await api.admin.getUsers(params);
        if (isMounted.current) {
          setUsers(data.data || data);
        }
      } catch (err) {
        if (isMounted.current) toast.error(err.message || 'خطا در بارگذاری کاربران');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchUsers();
    return () => { isMounted.current = false; };
  }, [filters]); // only depend on filters

  const handleBan = async () => {
    if (!selectedUser) return;
    try {
      await api.admin.banUser(selectedUser._id, { reason: banReason });
      toast.success('کاربر مسدود شد');
      setBanDialogOpen(false);
      setBanReason('');
      // re-fetch: force effect to run by updating filters? easier: call fetch again but without breaking rules.
      // We'll just trigger a re-fetch by toggling a dummy state? Instead, we can manually call fetch
      // but we'll reuse the logic. Since the fetch function is inside useEffect, we can't call it directly.
      // Option: add a timestamp to filters or a refresh flag.
      // For simplicity, we'll update a dummy state that triggers useEffect.
      setFilters(prev => ({ ...prev, dummy: Date.now() }));
    } catch (err) {
      toast.error(err.message || 'خطا در مسدودسازی');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await api.admin.unbanUser(userId);
      toast.success('مسدودیت کاربر برداشته شد');
      setFilters(prev => ({ ...prev, dummy: Date.now() }));
    } catch (err) {
      toast.error(err.message || 'خطا در رفع مسدودیت');
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await api.admin.changeRole(selectedUser._id, newRole);
      toast.success(`نقش کاربر به "${newRole}" تغییر کرد`);
      setRoleDialogOpen(false);
      setFilters(prev => ({ ...prev, dummy: Date.now() }));
    } catch (err) {
      toast.error(err.message || 'خطا در تغییر نقش');
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('آیا از حذف کاربر مطمئن هستید؟ این عمل غیرقابل بازگشت است.')) {
      try {
        await api.admin.deleteUser(userId);
        toast.success('کاربر حذف شد');
        setFilters(prev => ({ ...prev, dummy: Date.now() }));
      } catch (err) {
        toast.error(err.message || 'خطا در حذف کاربر');
      }
    }
  };

  const openRoleDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-foreground">مدیریت کاربران</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="جستجو بر اساس نام، ایمیل یا تلفن..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-64"
        />
        <Select value={filters.role} onValueChange={(val) => setFilters({ ...filters, role: val })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="نقش" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">همه</SelectItem>
            <SelectItem value="user">کاربر عادی</SelectItem>
            <SelectItem value="instructor">مدرس</SelectItem>
            <SelectItem value="admin">ادمین</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setFilters({ search: '', role: '' })}>
          پاک کردن فیلترها
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>ایمیل</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center">کاربری یافت نشد</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openRoleDialog(user)}>
                      <Shield className="w-4 h-4 ml-1" />
                      {user.role === 'admin' ? 'مدیر' : user.role === 'instructor' ? 'مدرس' : 'کاربر'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <Badge variant="destructive">مسدود</Badge>
                    ) : (
                      <Badge variant="default">فعال</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.isBanned ? (
                        <Button size="sm" variant="outline" onClick={() => handleUnban(user._id)}>
                          رفع مسدودیت
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setSelectedUser(user); setBanDialogOpen(true); }}>
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDelete(user._id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>مسدود کردن کاربر</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">دلیل مسدودیت</Label>
              <Input id="reason" value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="اختیاری" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>انصراف</Button>
            <Button variant="destructive" onClick={handleBan}>مسدود کردن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>تغییر نقش کاربر</DialogTitle></DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger><SelectValue placeholder="انتخاب نقش" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">کاربر عادی</SelectItem>
                <SelectItem value="instructor">مدرس</SelectItem>
                <SelectItem value="admin">مدیر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleRoleChange}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}