'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAsyncEffect } from '@/hooks/useAsyncEffect';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function TicketsTable() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useAsyncEffect(async (isMounted) => {
    setLoading(true);
    try {
      const data = await api.admin.getTickets();
      if (isMounted.current) {
        setTickets(data);
      }
    } catch (err) {
      if (isMounted.current) {
        toast.error('خطا در بارگذاری تیکت‌ها');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'باز';
      case 'in_progress': return 'در حال بررسی';
      case 'closed': return 'بسته';
      default: return status;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'low': return 'کم';
      case 'medium': return 'متوسط';
      case 'high': return 'بالا';
      default: return priority;
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">تیکت‌های پشتیبانی</h2>
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>دوره</TableHead>
              <TableHead>موضوع</TableHead>
              <TableHead>اولویت</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>آخرین بروزرسانی</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : tickets.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center">هیچ تیکتی یافت نشد</TableCell></TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell>{ticket.user?.name}</TableCell>
                  <TableCell>{ticket.course?.title}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getPriorityLabel(ticket.priority)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === 'closed' ? 'secondary' : 'default'}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(ticket.updatedAt).toLocaleDateString('fa-IR')}</TableCell>
                  <TableCell>
                    <Link href={`/admin/tickets/${ticket._id}`}>
                      <Button size="sm" variant="outline">مشاهده</Button>
                    </Link>
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