// app/admin/reviews/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, Trash2 } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await api.admin.getPendingReviews();
        if (isMounted.current) setReviews(data.data || data);
      } catch (err) {
        if (isMounted.current) toast.error(err.message || 'خطا در بارگذاری نظرات');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchReviews();
    return () => { isMounted.current = false; };
  }, [refreshKey]);

  const handleApprove = async (id) => {
    try {
      await api.reviews.approve(id);
      toast.success('نظر تأیید شد');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      toast.error(err.message || 'خطا در تأیید نظر');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('آیا از حذف این نظر مطمئن هستید؟')) {
      try {
        await api.reviews.delete(id);
        toast.success('نظر حذف شد');
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        toast.error(err.message || 'خطا در حذف نظر');
      }
    }
  };

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-foreground">نظرات نیازمند تأیید</h1>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>دوره</TableHead>
              <TableHead>نظر</TableHead>
              <TableHead>امتیاز</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : reviews.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center">هیچ نظری در انتظار تأیید نیست</TableCell></TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>{review.user?.name}</TableCell>
                  <TableCell>{review.course?.title}</TableCell>
                  <TableCell className="max-w-md truncate">{review.comment}</TableCell>
                  <TableCell>{review.rating}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleApprove(review._id)}>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(review._id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
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