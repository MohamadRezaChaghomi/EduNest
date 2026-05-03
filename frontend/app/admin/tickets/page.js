// app/admin/tickets/page.js
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const data = await api.admin.getTickets();
        setTickets(data.tickets);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleReply = async () => {
    if (!replyText.trim()) return toast.error('متن پاسخ را وارد کنید');
    setReplyLoading(true);
    try {
      await api.tickets.addMessage(selectedTicket._id, replyText);
      toast.success('پاسخ ارسال شد');
      setReplyText('');
      // به‌روزرسانی لیست تیکت‌ها یا بستن دیالوگ
      setSelectedTicket(null);
      // re-fetch
      const data = await api.admin.getTickets();
      setTickets(data.tickets);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'open': return <Badge className="bg-green-500">باز</Badge>;
      case 'in_progress': return <Badge className="bg-yellow-500">در حال بررسی</Badge>;
      case 'closed': return <Badge variant="secondary">بسته</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">تیکت‌های پشتیبانی</h1>
      <Table>
        <TableHeader><TableRow><TableHead>عنوان</TableHead><TableHead>کاربر</TableHead><TableHead>دوره</TableHead><TableHead>وضعیت</TableHead><TableHead>اولویت</TableHead><TableHead>عملیات</TableHead></TableRow></TableHeader>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={6}>بارگذاری...</TableCell></TableRow> :
            tickets.map(ticket => (
              <TableRow key={ticket._id}>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>{ticket.user?.name}</TableCell>
                <TableCell>{ticket.course?.title}</TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell>{ticket.priority === 'high' ? 'بالا' : ticket.priority === 'medium' ? 'متوسط' : 'پایین'}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => setSelectedTicket(ticket)}>مشاهده و پاسخ</Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedTicket?.subject}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">از طرف: {selectedTicket?.user?.name}</p>
              <p>{selectedTicket?.messages[0]?.message}</p>
            </div>
            {selectedTicket?.messages.slice(1).map((msg, idx) => (
              <div key={idx} className={`p-3 rounded ${msg.isStaffReply ? 'bg-blue-50 mr-6' : 'bg-gray-50 ml-6'}`}>
                <p className="text-xs text-gray-500">{msg.sender?.name} – {new Date(msg.createdAt).toLocaleString()}</p>
                <p>{msg.message}</p>
              </div>
            ))}
            <div>
              <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="پاسخ خود را بنویسید..." rows={3} />
              <Button className="mt-2" onClick={handleReply} disabled={replyLoading}>ارسال پاسخ</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}