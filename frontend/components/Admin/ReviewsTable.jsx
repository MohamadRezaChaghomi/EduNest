'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
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

export default function ReviewsTable() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingReviews = async (isMounted) => {
    setLoading(true);
    try {
      const data = await api.admin.getPendingReviews();
      if (isMounted.current) {
        setReviews(data);
      }
    } catch (err) {
      if (isMounted.current) {
        toast.error('خطا در بارگذاری نظرات');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useAsyncEffect(fetchPendingReviews, []);

  const handleApprove = async (id) => {
    try {
      await api.reviews.approve(id);
      toast.success('نظر تأیید شد');
      await fetchPendingReviews({ current: true }); // manually call with mounted true
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('آیا از حذف این نظر مطمئن هستید؟')) {
      try {
        await api.reviews.delete(id);
        toast.success('نظر حذف شد');
        await fetchPendingReviews({ current: true });
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handlePin = async (id, isPinned) => {
    try {
      await api.reviews.pin(id);
      toast.success(isPinned ? 'پین برداشته شد' : 'نظر پین شد');
      await fetchPendingReviews({ current: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-xl font-semibold">نظرات در انتظار تأیید</h2>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>دوره</TableHead>
              <TableHead>نظر</TableHead>
              <TableHead>امتیاز</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : reviews.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">هیچ نظری در انتظار تأیید نیست</TableCell></TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>{review.user?.name}</TableCell>
                  <TableCell>{review.course?.title}</TableCell>
                  <TableCell className="max-w-md truncate">{review.comment}</TableCell>
                  <TableCell>{review.rating || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={review.isApproved ? 'default' : 'secondary'}>
                      {review.isApproved ? 'تأیید شده' : 'در انتظار'}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(review._id)}>تأیید</Button>
                    <Button size="sm" variant="outline" onClick={() => handlePin(review._id, review.isPinned)}>
                      {review.isPinned ? 'لغو پین' : 'پین'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(review._id)}>حذف</Button>
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