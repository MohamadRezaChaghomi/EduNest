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
        const res = await api.admin.getLogs({ page: pagination.page, limit: 20, ...filters });
        setLogs(res.data);
        setPagination(res.pagination);
      } catch (err) {
        toast.error('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();

}, [pagination.page, filters]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="User ID or email"
          value={filters.user}
          onChange={(e) => setFilters({ ...filters, user: e.target.value, page: 1 })}
          className="max-w-sm"
        />
        <Select value={filters.action} onValueChange={(val) => setFilters({ ...filters, action: val, page: 1 })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
            <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
            <SelectItem value="REGISTER">Register</SelectItem>
            <SelectItem value="CHANGE_PASSWORD">Change Password</SelectItem>
            <SelectItem value="USER_BANNED">User Banned</SelectItem>
            <SelectItem value="USER_UNBANNED">User Unbanned</SelectItem>
            <SelectItem value="USER_DELETED">User Deleted</SelectItem>
            <SelectItem value="ROLE_CHANGE">Role Change</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val, page: 1 })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => {
          setPagination(prev => ({ ...prev, page: 1 }));
          // force refetch by changing filter dependency? already handled by useEffect
        }}>Refresh</Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>User Agent</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">No logs found</TableCell></TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    {log.user ? `${log.user.name} (${log.user.email})` : 'Anonymous'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.action}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell>{log.ip || '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{log.userAgent || '-'}</TableCell>
                  <TableCell>{formatDate(log.createdAt)}</TableCell>
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
    </div>
  );
}