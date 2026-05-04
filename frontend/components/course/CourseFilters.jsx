// app/courses/CourseFilters.jsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

export function CourseFilters({ initialFilters = {}, categories = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [level, setLevel] = useState(initialFilters.level || '');

  const updateFilters = useDebouncedCallback((search, cat, lvl) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (cat && cat !== 'all') params.set('category', cat);
    if (lvl && lvl !== 'all') params.set('level', lvl);
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  }, 400);

  useEffect(() => {
    updateFilters(searchTerm, category, level);
  }, [searchTerm, category, level, updateFilters, pathname]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setLevel('');
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8 items-end">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="جستجوی دوره..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>
      <div className="w-48">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌ها</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-48">
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger>
            <SelectValue placeholder="سطح دوره" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه سطوح</SelectItem>
            <SelectItem value="beginner">مبتدی</SelectItem>
            <SelectItem value="intermediate">متوسط</SelectItem>
            <SelectItem value="advanced">پیشرفته</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="ghost" onClick={handleClearFilters}>
        پاک کردن فیلترها
      </Button>
    </div>
  );
}