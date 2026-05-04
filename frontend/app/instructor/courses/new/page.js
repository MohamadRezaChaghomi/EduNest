// app/instructor/courses/new/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);
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
  });
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchCategories = async () => {
      try {
        const data = await api.categories.getAll();
        if (isMounted.current) setCategories(data);
      } catch (err) {
        if (isMounted.current) toast.error('خطا در دریافت دسته‌بندی‌ها');
      } finally {
        if (isMounted.current) setLoadingCats(false);
      }
    };
    fetchCategories();
    return () => { isMounted.current = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      const course = await api.courses.create(data);
      toast.success('دوره با موفقیت ایجاد شد');
      router.push(`/instructor/courses/${course._id}/curriculum`);
    } catch (err) {
      toast.error(err.message || 'خطا در ایجاد دوره');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">ایجاد دوره جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان دوره *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">توضیح کوتاه</Label>
              <Input
                id="shortDescription"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات کامل *</Label>
              <Textarea
                id="description"
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">قیمت (تومان) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">قیمت تخفیف‌خورده</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">دسته‌بندی *</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCats ? (
                      <SelectItem value="loading" disabled>در حال بارگذاری...</SelectItem>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">سطح</Label>
                <Select value={form.level} onValueChange={(val) => setForm({ ...form, level: val })}>
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
            <div className="space-y-2">
              <Label htmlFor="tags">برچسب‌ها (با کاما جدا کنید)</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="react, nextjs, javascript"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">وضعیت دوره</Label>
              <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
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
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'در حال ایجاد...' : 'ایجاد دوره'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}