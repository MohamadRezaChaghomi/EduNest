// app/dashboard/tickets/page.js
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await api.tickets.getTickets(); // نام متد در api.js 'getTickets' است
        setTickets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <Badge variant="default">باز</Badge>;
      case 'in_progress': return <Badge variant="secondary">در حال بررسی</Badge>;
      case 'closed': return <Badge variant="outline">بسته</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">تیکت‌های من</h2>
        <Link href="/dashboard/tickets/new">
          <Button>تیکت جدید</Button>
        </Link>
      </div>
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            هیچ تیکتی ثبت نکرده‌اید.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket._id} href={`/dashboard/tickets/${ticket._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        آخرین پیام: {new Date(ticket.updatedAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}