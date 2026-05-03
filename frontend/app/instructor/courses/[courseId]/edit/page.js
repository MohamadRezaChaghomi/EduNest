// app/instructor/courses/[courseId]/edit/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function EditCoursePage({ params }) {
  const { courseId } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    discountPrice: '',
    category: '',
    level: 'beginner',
    tags: '',
    status: 'draft',
    isPublished: false,
  });

  // بارگذاری اطلاعات دوره و دسته‌بندی‌ها
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, categoriesData] = await Promise.all([
          api.courses.getById(courseId),
          api.categories.getAll(),
        ]);
        setCategories(categoriesData);
        setForm({
          title: courseData.title || '',
          description: courseData.description || '',
          shortDescription: courseData.shortDescription || '',
          price: courseData.price?.toString() || '',
          discountPrice: courseData.discountPrice?.toString() || '',
          category: courseData.category?._id || courseData.category || '',
          level: courseData.level || 'beginner',
          tags: courseData.tags?.join(', ') || '',
          status: courseData.status || 'draft',
          isPublished: courseData.isPublished || false,
        });
      } catch (err) {
        console.error(err);
        toast.error('خطا در دریافت اطلاعات دوره');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        category: form.category,
        level: form.level,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: form.status,
        isPublished: form.isPublished,
      };
      await api.courses.update(courseId, data);
      toast.success('دوره با موفقیت به‌روزرسانی شد');
      router.push('/instructor/courses');
    } catch (err) {
      toast.error(err.message || 'خطا در ویرایش دوره');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="flex justify-center items-center h-64">در حال بارگذاری...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ویرایش دوره</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">عنوان دوره</Label>
          <Input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="shortDescription">توضیح کوتاه</Label>
          <Input id="shortDescription" name="shortDescription" value={form.shortDescription} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="description">توضیحات کامل</Label>
          <Textarea id="description" name="description" rows={5} value={form.description} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">قیمت (تومان)</Label>
            <Input id="price" name="price" type="number" value={form.price} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="discountPrice">قیمت تخفیف‌خورده (اختیاری)</Label>
            <Input id="discountPrice" name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">دسته‌بندی</Label>
            <Select value={form.category} onValueChange={(val) => setForm(prev => ({ ...prev, category: val }))}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="level">سطح</Label>
            <Select value={form.level} onValueChange={(val) => setForm(prev => ({ ...prev, level: val }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">مبتدی</SelectItem>
                <SelectItem value="intermediate">متوسط</SelectItem>
                <SelectItem value="advanced">پیشرفته</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="tags">برچسب‌ها (با کاما جدا کنید)</Label>
          <Input id="tags" name="tags" value={form.tags} onChange={handleChange} placeholder="react, nextjs, javascript" />
        </div>
        <div>
          <Label htmlFor="status">وضعیت دوره</Label>
          <Select value={form.status} onValueChange={(val) => setForm(prev => ({ ...prev, status: val }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">پیش‌نویس</SelectItem>
              <SelectItem value="teaching">در حال تدریس</SelectItem>
              <SelectItem value="prerelease">پیش‌فروش</SelectItem>
              <SelectItem value="completed">تکمیل شده</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPublished" name="isPublished" checked={form.isPublished} onChange={handleChange} />
          <Label htmlFor="isPublished">منتشر شود (قابل نمایش در فروشگاه)</Label>
        </div>
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>ذخیره تغییرات</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>انصراف</Button>
        </div>
      </form>
    </div>
  );
}