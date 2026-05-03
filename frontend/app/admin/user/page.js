// app/admin/users/page.js
'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Ban, Trash2, Shield } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', role: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    // تابع fetch داخل useEffect تعریف نمی‌شود – بلکه مستقیماً در useEffect صدا می‌زنیم.
    // اما برای رفع خطای linting، تابع را داخل useEffect تعریف می‌کنیم.
  };

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.role) params.role = filters.role;
        const data = await api.admin.getUsers(params);
        setUsers(data.users);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [filters]);

  const handleBan = async () => {
    if (!selectedUser) return;
    try {
      await api.admin.banUser(selectedUser._id, { reason: banReason });
      toast.success('کاربر بن شد');
      setBanDialogOpen(false);
      setBanReason('');
      fetchUsers(); // re-fetch
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUnban = async (userId) => {
    try {
      await api.admin.unbanUser(userId);
      toast.success('بن برداشته شد');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.admin.changeRole(userId, newRole);
      toast.success(`نقش کاربر به ${newRole} تغییر کرد`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('آیا از حذف کاربر مطمئن هستید؟')) {
      try {
        await api.admin.deleteUser(userId);
        toast.success('کاربر حذف شد');
        fetchUsers();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">مدیریت کاربران</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <Input placeholder="جستجو..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-64" />
        <Select value={filters.role} onValueChange={(val) => setFilters({...filters, role: val})}>
          <SelectTrigger className="w-40"><SelectValue placeholder="نقش" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">همه</SelectItem>
            <SelectItem value="user">کاربر عادی</SelectItem>
            <SelectItem value="instructor">مدرس</SelectItem>
            <SelectItem value="admin">ادمین</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow><TableHead>نام</TableHead><TableHead>ایمیل</TableHead><TableHead>نقش</TableHead><TableHead>وضعیت</TableHead><TableHead>عملیات</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={5}>بارگذاری...</TableCell></TableRow> :
            users.map(user => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select value={user.role} onValueChange={(val) => handleRoleChange(user._id, val)}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">کاربر</SelectItem>
                      <SelectItem value="instructor">مدرس</SelectItem>
                      <SelectItem value="admin">ادمین</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{user.isBanned ? <Badge variant="destructive">بن شده</Badge> : <Badge>فعال</Badge>}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.isBanned ? (
                      <Button size="sm" variant="outline" onClick={() => handleUnban(user._id)}>لغو بن</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => { setSelectedUser(user); setBanDialogOpen(true); }}><Ban className="w-4 h-4" /></Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleDelete(user._id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>بن کاربر</DialogTitle></DialogHeader>
          <Input placeholder="دلیل بن" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
          <Button onClick={handleBan}>تأیید بن</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}