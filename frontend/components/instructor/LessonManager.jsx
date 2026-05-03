'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonManager({ lesson, sectionId, courseId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || '');
  const [isFree, setIsFree] = useState(lesson.isFree);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl);

  const handleUpdate = async () => {
    if (!title.trim()) return toast.error('عنوان درس الزامی است');
    try {
      await api.lessons.update(lesson._id, { title, description, isFree });
      setIsEditing(false);
      toast.success('درس ویرایش شد');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (confirm('آیا از حذف این درس مطمئن هستید؟')) {
      try {
        await api.lessons.delete(lesson._id);
        toast.success('درس حذف شد');
        window.location.reload(); // ساده‌ترین راه برای رفرش لیست
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) return toast.error('فایل باید ویدیو باشد');
    if (file.size > 100 * 1024 * 1024) return toast.error('حجم ویدیو نباید بیشتر از 100 مگابایت باشد');

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/lessons/${lesson._id}/video`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setVideoUrl(data.url);
      toast.success('ویدیو آپلود شد');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-md p-3 mb-2 bg-white">
      {isEditing ? (
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان درس" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات" rows={2} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
            درس رایگان
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleUpdate}><Save className="w-4 h-4" /> ذخیره</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>لغو</Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{lesson.title}</span>
              {lesson.isFree && <Badge variant="outline" className="text-xs">رایگان</Badge>}
              {videoUrl && <Badge variant="secondary" className="text-xs">ویدیو آپلود شده</Badge>}
              {!videoUrl && <Badge variant="destructive" className="text-xs">بدون ویدیو</Badge>}
            </div>
            {lesson.description && <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>}
            {lesson.videoDuration > 0 && (
              <p className="text-xs text-gray-400 mt-1">مدت: {Math.floor(lesson.videoDuration / 60)} دقیقه</p>
            )}
          </div>
          <div className="flex gap-1">
            <label className="cursor-pointer">
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
              <Button size="icon" variant="outline" disabled={uploading}>{uploading ? <Upload className="animate-spin" /> : <Upload className="w-4 h-4" />}</Button>
            </label>
            <Button size="icon" variant="outline" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4" /></Button>
            <Button size="icon" variant="outline" onClick={handleDelete}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}