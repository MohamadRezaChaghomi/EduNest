// app/admin/tickets/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns/fa-IR';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const data = await api.admin.getTickets();
        if (isMounted.current) setTickets(data.data || data);
      } catch (err) {
        if (isMounted.current) toast.error(err.message || 'خطا در بارگذاری تیکت‌ها');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchTickets();
    return () => { isMounted.current = false; };
  }, [refreshKey]);

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('متن پاسخ را وارد کنید');
      return;
    }
    setReplyLoading(true);
    try {
      await api.tickets.addMessage(selectedTicket._id, replyText);
      toast.success('پاسخ با موفقیت ارسال شد');
      setReplyText('');
      setRefreshKey(prev => prev + 1);
      const updated = await api.tickets.getTicketById(selectedTicket._id);
      if (isMounted.current) setSelectedTicket(updated);
    } catch (err) {
      toast.error(err.message || 'خطا در ارسال پاسخ');
    } finally {
      setReplyLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <Badge className="bg-green-500">باز</Badge>;
      case 'in_progress': return <Badge className="bg-yellow-500">در حال بررسی</Badge>;
      case 'closed': return <Badge variant="secondary">بسته</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-foreground">تیکت‌های پشتیبانی</h1>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>کاربر</TableHead>
              <TableHead>دوره</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>اولویت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : tickets.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">هیچ تیکتی یافت نشد</TableCell></TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell className="font-medium">{ticket.subject}</TableCell>
                  <TableCell>{ticket.user?.name}</TableCell>
                  <TableCell>{ticket.course?.title}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>
                    {ticket.priority === 'high' ? 'بالا' : ticket.priority === 'medium' ? 'متوسط' : 'پایین'}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setSelectedTicket(ticket)}>
                      مشاهده و پاسخ
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تیکت: {selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>{selectedTicket?.user?.name}</span>
                <span>{selectedTicket && formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}</span>
              </div>
              <p className="text-foreground">{selectedTicket?.messages[0]?.message}</p>
            </div>
            {selectedTicket?.messages.slice(1).map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${msg.isStaffReply ? 'bg-primary/10 mr-6' : 'bg-muted ml-6'}`}>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>{msg.sender?.name}</span>
                  <span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="text-foreground">{msg.message}</p>
                {msg.isStaffReply && <Badge variant="outline" className="mt-1 text-xs">پاسخ پشتیبانی</Badge>}
              </div>
            ))}
            <div className="pt-4">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پاسخ خود را بنویسید..."
                rows={3}
                disabled={replyLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>بستن</Button>
            <Button onClick={handleReply} disabled={replyLoading}>
              {replyLoading ? 'در حال ارسال...' : 'ارسال پاسخ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}