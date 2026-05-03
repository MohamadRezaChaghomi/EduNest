'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, Trash2 } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // تابع fetchReviews را درون useEffect تعریف می‌کنیم
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await api.admin.getReviews({ isApproved: false });
        setReviews(data.reviews);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []); // وابستگی خالی

  const handleApprove = async (id) => {
    try {
      await api.reviews.approve(id);
      toast.success('نظر تأیید شد');
      // بارگذاری مجدد
      const data = await api.admin.getReviews({ isApproved: false });
      setReviews(data.reviews);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('حذف شود؟')) {
      try {
        await api.reviews.delete(id);
        toast.success('نظر حذف شد');
        const data = await api.admin.getReviews({ isApproved: false });
        setReviews(data.reviews);
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">نظرات نیازمند تأیید</h1>
      <Table>
        <TableHeader><TableRow><TableHead>کاربر</TableHead><TableHead>دوره</TableHead><TableHead>نظر</TableHead><TableHead>امتیاز</TableHead><TableHead>عملیات</TableHead></TableRow></TableHeader>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={5}>بارگذاری...</TableCell></TableRow> :
            reviews.map(review => (
              <TableRow key={review._id}>
                <TableCell>{review.user?.name}</TableCell>
                <TableCell>{review.course?.title}</TableCell>
                <TableCell>{review.comment}</TableCell>
                <TableCell>{review.rating}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleApprove(review._id)}><CheckCircle className="w-4 h-4 text-green-600" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(review._id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}