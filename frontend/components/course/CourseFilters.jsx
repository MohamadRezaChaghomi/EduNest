// app/courses/CourseFilters.js
'use client';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

export function CourseFilters({ initialFilters }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
  const [category, setCategory] = useState(initialFilters?.category || '');
  const [level, setLevel] = useState(initialFilters?.level || '');

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (category) params.set('category', category);
    if (level) params.set('level', level);
    router.push(`/courses?${params.toString()}`);
  }, [searchTerm, category, level, router]);

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <Input
        placeholder="جستجوی دوره..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-64"
      />
      {/* کامپوننت‌های Select نیز به همین شکل */}
    </div>
  );
}