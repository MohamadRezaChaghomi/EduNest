// app/dashboard/tickets/page.js
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await api.tickets.getMyTickets();
        setTickets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">تیکت‌های من</h2>
        <Link href="/dashboard/tickets/new">
          <Button>تیکت جدید</Button>
        </Link>
      </div>
      <div className="space-y-3">
        {tickets.length === 0 && <p>هیچ تیکتی ثبت نکرده‌اید.</p>}
        {tickets.map(ticket => (
          <Link key={ticket._id} href={`/dashboard/tickets/${ticket._id}`}>
            <div className="border p-4 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between">
                <span className="font-semibold">{ticket.subject}</span>
                <span className={`text-sm ${ticket.status === 'open' ? 'text-green-600' : ticket.status === 'closed' ? 'text-gray-500' : 'text-yellow-600'}`}>
                  {ticket.status === 'open' ? 'باز' : ticket.status === 'in_progress' ? 'در حال بررسی' : 'بسته'}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">آخرین پیام: {new Date(ticket.updatedAt).toLocaleDateString('fa-IR')}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}