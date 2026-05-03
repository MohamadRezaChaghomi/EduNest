'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Rating } from '@/components/ui/rating'; // مطمئن شوید این کامپوننت وجود دارد یا از یک input ساده استفاده کنید
import { toast } from 'sonner';

export default function CourseReviews({ courseId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await api.reviews.getByCourse(courseId);
        setReviews(data.reviews);
      } catch (error) {
        console.error(error);
      }
    };
    loadReviews();
  }, [courseId]);

  const handleSubmit = async () => {
    if (!user) return toast.error('برای نظر دادن وارد شوید');
    setLoading(true);
    try {
      await api.reviews.create({ course: courseId, rating: newRating, comment: newComment });
      toast.success('نظر شما ثبت شد و پس از تایید نمایش داده می‌شود');
      setNewComment('');
      setNewRating(5);
      // بارگذاری مجدد نظرات
      const data = await api.reviews.getByCourse(courseId);
      setReviews(data.reviews);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">نظرات کاربران ({reviews.length})</h2>
      {user && (
        <div className="mb-6 p-4 border rounded-lg">
          <h3>نظر خود را بنویسید</h3>
          {/* در صورت نداشتن کامپوننت Rating، از select استفاده کنید */}
          <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} className="border rounded p-1">
            {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} ستاره</option>)}
          </select>
          <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} className="mt-2" />
          <Button onClick={handleSubmit} disabled={loading} className="mt-2">ارسال نظر</Button>
        </div>
      )}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-4">
            <div className="flex justify-between">
              <span className="font-semibold">{review.user?.name}</span>
              <span className="text-sm text-yellow-500">⭐ {review.rating}</span>
            </div>
            <p className="text-gray-600 mt-1">{review.comment}</p>
            {review.replies?.length > 0 && (
              <div className="mr-6 mt-2 space-y-2">
                {review.replies.map((reply) => (
                  <div key={reply._id} className="bg-gray-50 p-2 rounded">
                    <span className="font-semibold text-sm">{reply.user?.name}</span>
                    <p className="text-sm">{reply.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}