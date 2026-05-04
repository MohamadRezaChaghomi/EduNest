'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonManager({ lesson, sectionId, courseId, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || '');
  const [isFree, setIsFree] = useState(lesson.isFree);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl);
  const [updating, setUpdating] = useState(false);

  // Handle lesson update
  const handleUpdate = async () => {
    if (!title.trim()) {
      toast.error('عنوان درس الزامی است');
      return;
    }
    setUpdating(true);
    try {
      const updatedLesson = await api.lessons.update(lesson._id, { title, description, isFree });
      setVideoUrl(updatedLesson.videoUrl); // in case URL changed
      setIsEditing(false);
      onUpdate?.(updatedLesson);
      toast.success('درس با موفقیت ویرایش شد');
    } catch (err) {
      toast.error(err.message || 'خطا در ویرایش درس');
    } finally {
      setUpdating(false);
    }
  };

  // Handle lesson deletion
  const handleDelete = async () => {
    if (confirm('آیا از حذف این درس مطمئن هستید؟')) {
      try {
        await api.lessons.delete(lesson._id);
        onDelete?.(lesson._id);
        toast.success('درس حذف شد');
      } catch (err) {
        toast.error(err.message || 'خطا در حذف درس');
      }
    }
  };

  // Handle video upload using api.upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('فایل باید ویدیو باشد');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('حجم ویدیو نباید بیشتر از ۱۰۰ مگابایت باشد');
      return;
    }

    setUploading(true);
    try {
      const data = await api.upload.lessonVideo(lesson._id, file);
      setVideoUrl(data.url);
      toast.success('ویدیو با موفقیت آپلود شد');
      // Refresh lesson data (optional)
      const updatedLesson = await api.lessons.getById(lesson._id);
      onUpdate?.(updatedLesson);
    } catch (err) {
      toast.error(err.message || 'خطا در آپلود ویدیو');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-md p-3 mb-2 bg-card border-border" dir="rtl">
      {isEditing ? (
        // Edit mode
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان درس"
            disabled={updating}
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات"
            rows={2}
            disabled={updating}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              disabled={updating}
            />
            <span>درس رایگان (پیش‌نمایش برای همه)</span>
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleUpdate} disabled={updating}>
              <Save className="w-4 h-4 ml-1" /> ذخیره
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={updating}>
              <X className="w-4 h-4 ml-1" /> لغو
            </Button>
          </div>
        </div>
      ) : (
        // View mode
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground">{lesson.title}</span>
              {lesson.isFree && <Badge variant="outline" className="text-xs">رایگان</Badge>}
              {videoUrl && <Badge variant="secondary" className="text-xs">ویدیو آپلود شده</Badge>}
              {!videoUrl && <Badge variant="destructive" className="text-xs">بدون ویدیو</Badge>}
            </div>
            {lesson.description && (
              <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
            )}
            {lesson.videoDuration > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                مدت: {Math.floor(lesson.videoDuration / 60)} دقیقه
              </p>
            )}
          </div>
          <div className="flex gap-1">
            {/* Video upload button */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
                disabled={uploading}
              />
              <Button size="icon" variant="outline" disabled={uploading}>
                {uploading ? <Upload className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </Button>
            </label>
            <Button size="icon" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}