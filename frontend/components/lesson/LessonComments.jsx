'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns/fa-IR';

export default function LessonComments({ lessonId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isMounted = useRef(true);

  // Fetch comments – defined inside useEffect to avoid setState warning
  useEffect(() => {
    isMounted.current = true;
    const loadComments = async () => {
      setLoading(true);
      try {
        const data = await api.lessonComments.getByLesson(lessonId);
        if (isMounted.current) {
          setComments(data.comments || []);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
        if (isMounted.current) toast.error('خطا در بارگذاری نظرات');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    loadComments();

    return () => {
      isMounted.current = false;
    };
  }, [lessonId]); // Only re-run when lessonId changes

  const handleSubmit = async () => {
    if (!user) {
      toast.error('برای نظر دادن وارد شوید');
      return;
    }
    if (!newComment.trim()) {
      toast.error('متن نظر را وارد کنید');
      return;
    }
    setSubmitting(true);
    try {
      await api.lessonComments.create({
        lessonId,
        comment: newComment,
        parentComment: replyTo?.id || null,
      });
      toast.success(replyTo ? 'پاسخ شما ثبت شد' : 'نظر شما ثبت شد');
      setNewComment('');
      setReplyTo(null);
      // Reload comments after successful submit
      const data = await api.lessonComments.getByLesson(lessonId);
      if (isMounted.current) setComments(data.comments || []);
    } catch (err) {
      toast.error(err.message || 'خطا در ثبت نظر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId, userName) => {
    setReplyTo({ id: commentId, name: userName });
    document.getElementById('comment-textarea')?.focus();
  };

  const cancelReply = () => setReplyTo(null);

  return (
    <div className="bg-card border-border rounded-lg shadow p-4" dir="rtl">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        نظرات این درس ({comments.length})
      </h3>

      {loading && <p className="text-muted-foreground text-center">در حال بارگذاری نظرات...</p>}

      {!loading && user && (
        <div className="mb-6 p-3 bg-muted/20 rounded-lg">
          {replyTo && (
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <span>در حال پاسخ به <strong>{replyTo.name}</strong></span>
              <Button variant="ghost" size="sm" onClick={cancelReply}>لغو</Button>
            </div>
          )}
          <Textarea
            id="comment-textarea"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? 'پاسخ خود را بنویسید...' : 'نظر خود را بنویسید...'}
            rows={3}
            disabled={submitting}
          />
          <Button onClick={handleSubmit} disabled={submitting} className="mt-2">
            {submitting ? 'در حال ارسال...' : replyTo ? 'ارسال پاسخ' : 'ارسال نظر'}
          </Button>
        </div>
      )}

      <div className="space-y-5">
        {!loading && comments.length === 0 && (
          <p className="text-muted-foreground text-center">هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
        )}
        {comments.map((comment) => (
          <div key={comment._id} className="border-b border-border pb-3 last:border-0">
            <div className="flex gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user?.profileImage} />
                <AvatarFallback>{comment.user?.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <span className="font-semibold text-foreground">{comment.user?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground mt-1">{comment.comment}</p>
                <div className="flex gap-3 mt-1">
                  {user && (
                    <button
                      onClick={() => handleReply(comment._id, comment.user?.name)}
                      className="text-xs text-primary hover:underline"
                    >
                      پاسخ
                    </button>
                  )}
                  {!comment.isApproved && comment.user?._id === user?.id && (
                    <Badge variant="outline" className="text-xs">در انتظار تأیید</Badge>
                  )}
                </div>
              </div>
            </div>

            {comment.replies?.length > 0 && (
              <div className="mr-8 mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="flex gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={reply.user?.profileImage} />
                      <AvatarFallback>{reply.user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="font-semibold text-sm">{reply.user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{reply.comment}</p>
                      {reply.isOfficial && <Badge className="text-xs mt-1">پاسخ رسمی</Badge>}
                    </div>
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