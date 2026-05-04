// app/dashboard/tickets/[id]/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns/fa-IR';

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchTicket = async () => {
      try {
        const data = await api.tickets.getTicketById(id);
        if (isMounted.current) setTicket(data);
      } catch (err) {
        if (isMounted.current) toast.error('خطا در دریافت تیکت');
        router.push('/dashboard/tickets');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchTicket();
    return () => { isMounted.current = false; };
  }, [id, router]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('متن پیام را وارد کنید');
      return;
    }
    setSubmitting(true);
    try {
      await api.tickets.addMessage(id, newMessage);
      toast.success('پیام ارسال شد');
      setNewMessage('');
      // بارگذاری مجدد تیکت
      const updated = await api.tickets.getTicketById(id);
      if (isMounted.current) setTicket(updated);
    } catch (err) {
      toast.error(err.message || 'خطا در ارسال پیام');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }
  if (!ticket) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{ticket.subject}</CardTitle>
            <Badge variant={ticket.status === 'closed' ? 'outline' : 'default'}>
              {ticket.status === 'open' ? 'باز' : ticket.status === 'in_progress' ? 'در حال بررسی' : 'بسته'}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            دوره: {ticket.course?.title} | اولویت: {ticket.priority === 'high' ? 'بالا' : ticket.priority === 'medium' ? 'متوسط' : 'پایین'}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* پیام اولیه */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>{ticket.user?.name}</span>
              <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            </div>
            <p className="text-foreground">{ticket.messages?.[0]?.message}</p>
          </div>

          {/* سایر پیام‌ها */}
          {ticket.messages?.slice(1).map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${msg.isStaffReply ? 'bg-primary/10 mr-6' : 'bg-muted ml-6'}`}
            >
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>{msg.sender?.name}</span>
                <span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
              </div>
              <p className="text-foreground">{msg.message}</p>
              {msg.isStaffReply && <Badge variant="outline" className="mt-1 text-xs">پاسخ پشتیبانی</Badge>}
            </div>
          ))}

          {/* فرم ارسال پیام جدید (در صورت باز بودن تیکت) */}
          {ticket.status !== 'closed' && (
            <div className="pt-4 border-t">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={4}
                placeholder="پاسخ خود را بنویسید..."
                disabled={submitting}
              />
              <Button onClick={handleSendMessage} disabled={submitting} className="mt-3">
                {submitting ? 'در حال ارسال...' : 'ارسال پیام'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router.push('/dashboard/tickets')}>
          بازگشت به لیست تیکت‌ها
        </Button>
      </div>
    </div>
  );
}