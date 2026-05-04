'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Rating } from '@/components/ui/rating';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns/fa-IR';

export default function CourseReviews({ courseId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Define the fetcher function inside the Effect
  useEffect(() => {
    let isMounted = true; // (Optional but recommended) Prevent state updates on unmounted component

    const loadReviews = async () => {
      try {
        const data = await api.reviews.getByCourse(courseId);
        if (isMounted) {
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [courseId]); // Dependencies are now correct

  const handleSubmit = async () => {
    if (!user) {
      toast.error('برای نظر دادن وارد شوید');
      return;
    }
    if (!newComment.trim()) {
      toast.error('لطفاً متن نظر را وارد کنید');
      return;
    }
    setLoading(true);
    try {
      await api.reviews.create({
        course: courseId,
        rating: newRating,
        comment: newComment,
      });
      toast.success('نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود');
      setNewComment('');
      setNewRating(5);
      // Re-fetch reviews after submission (direct call, no re-render loop)
      const data = await api.reviews.getByCourse(courseId);
      setReviews(data.reviews || []);
    } catch (error) {
      toast.error(error.message || 'خطا در ثبت نظر');
    } finally {
      setLoading(false);
    }
  };

  if (!courseId) return null;

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-6">
      <h2 className="text-2xl font-bold mb-4">
        نظرات کاربران ({reviews.length})
      </h2>

      {/* Review form */}
      {user && (
        <div className="mb-8 p-4 border rounded-lg bg-muted/20">
          <h3 className="font-semibold mb-3">نظر خود را بنویسید</h3>
          <div className="space-y-3">
            <Rating value={newRating} onChange={setNewRating} />
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder="نظر خود را بنویسید..."
            />
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'در حال ارسال...' : 'ارسال نظر'}
            </Button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.length === 0 && (
          <p className="text-muted-foreground text-center">
            هنوز نظری ثبت نشده است. اولین نفر باشید!
          </p>
        )}
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-4 last:border-0">
            <div className="flex justify-between items-start">
              <div className="flex gap-2 items-center">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={review.user?.profileImage} />
                  <AvatarFallback>
                    {review.user?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold">{review.user?.name}</span>
                  <div className="flex items-center gap-2 text-sm text-yellow-500">
                    {'⭐'.repeat(Math.floor(review.rating))}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              {review.isOfficial && (
                <Badge className="bg-primary text-primary-foreground">
                  پاسخ رسمی
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-2">{review.comment}</p>

            {/* Replies */}
            {review.replies?.length > 0 && (
              <div className="mr-6 mt-3 space-y-2">
                {review.replies.map((reply) => (
                  <div key={reply._id} className="bg-muted/30 p-3 rounded-lg">
                    <div className="flex gap-2 items-center">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback>
                          {reply.user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm">{reply.user?.name}</span>
                      {reply.isOfficial && <Badge variant="outline" className="text-xs">رسمی</Badge>}
                    </div>
                    <p className="text-sm mt-1">{reply.comment}</p>
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