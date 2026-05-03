'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function LessonComments({ lessonId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  // تابع داخل useEffect تعریف شده
  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await api.lessonComments.getByLesson(lessonId);
        setComments(data.comments);
      } catch (err) {
        console.error(err);
      }
    };
    loadComments();
  }, [lessonId]);
  
  const handleSubmit = async () => {
    if (!user) return toast.error('برای نظر دادن وارد شوید');
    setLoading(true);
    try {
      await api.lessonComments.create({ lessonId, comment: newComment });
      toast.success('نظر شما ثبت شد');
      setNewComment('');
      // بارگذاری مجدد نظرات
      const data = await api.lessonComments.getByLesson(lessonId);
      setComments(data.comments);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">نظرات این درس ({comments.length})</h3>
      {user && (
        <div className="mb-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="نظر خود را بنویسید..."
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={loading} className="mt-2">ارسال نظر</Button>
        </div>
      )}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment._id} className="border-b pb-2">
            <div className="flex justify-between">
              <span className="font-semibold">{comment.user?.name}</span>
              <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString('fa-IR')}</span>
            </div>
            <p className="text-gray-700 mt-1">{comment.comment}</p>
            {comment.replies?.map(reply => (
              <div key={reply._id} className="mr-6 mt-2 p-2 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <span className="font-semibold text-sm">{reply.user?.name}</span>
                </div>
                <p className="text-sm">{reply.comment}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}