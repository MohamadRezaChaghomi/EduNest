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
        toast.error('Failed to load users');
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
      toast.success('User banned');
      setBanDialog({ open: false, userId: null, reason: '', expiresAt: '' });
      // refetch by triggering useEffect (page or filters unchanged, so we manually call? useEffect will re-run if page/filters change, but we can force by changing a dummy state? Instead just update page to itself triggers refetch)
      setPagination(prev => ({ ...prev, page: prev.page }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUnban = async (userId) => {
    try {
      await api.admin.unbanUser(userId);
      toast.success('User unbanned');
      setPagination(prev => ({ ...prev, page: prev.page }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('Delete this user permanently? This action cannot be undone.')) {
      try {
        await api.admin.deleteUser(userId);
        toast.success('User deleted');
        setPagination(prev => ({ ...prev, page: prev.page }));
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const openRoleDialog = (userId, currentRole) => {
    setRoleDialog({ open: true, userId, newRole: currentRole });
  };

  const handleRoleChange = async () => {
    try {
      await api.admin.changeRole(roleDialog.userId, roleDialog.newRole);
      toast.success('Role updated');
      setRoleDialog({ open: false, userId: null, newRole: '' });
      setPagination(prev => ({ ...prev, page: prev.page }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by name, email or phone"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="max-w-sm"
        />
        <Select
          value={filters.role}
          onValueChange={(val) => setFilters({ ...filters, role: val, page: 1 })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setPagination(prev => ({ ...prev, page: prev.page }))}>
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">No users found</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openRoleDialog(user._id, user.role)}>
                      {user.role}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <span className="text-red-600 font-medium">Banned</span>
                    ) : (
                      <span className="text-green-600 font-medium">Active</span>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {!user.isBanned ? (
                      <Button variant="destructive" size="sm" onClick={() => setBanDialog({ open: true, userId: user._id, reason: '', expiresAt: '' })}>
                        Ban
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleUnban(user._id)}>
                        Unban
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span className="py-2 px-3">Page {pagination.page} of {pagination.pages}</span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Ban Dialog */}
      <Dialog open={banDialog.open} onOpenChange={(open) => !open && setBanDialog({ open: false, userId: null, reason: '', expiresAt: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>Provide a reason and optional expiration date.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" value={banDialog.reason} onChange={(e) => setBanDialog({ ...banDialog, reason: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At (optional)</Label>
              <Input id="expiresAt" type="datetime-local" value={banDialog.expiresAt} onChange={(e) => setBanDialog({ ...banDialog, expiresAt: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialog({ open: false, userId: null, reason: '', expiresAt: '' })}>Cancel</Button>
            <Button variant="destructive" onClick={handleBan}>Ban User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => !open && setRoleDialog({ open: false, userId: null, newRole: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>Select a new role for this user.</DialogDescription>
          </DialogHeader>
          <Select value={roleDialog.newRole} onValueChange={(val) => setRoleDialog({ ...roleDialog, newRole: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog({ open: false, userId: null, newRole: '' })}>Cancel</Button>
            <Button onClick={handleRoleChange}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}