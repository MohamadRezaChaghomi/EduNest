// components/home/CategoryList.jsx
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function CategoryList({ categories }) {
  if (!categories || categories.length === 0) return null;
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">دسته‌بندی‌های محبوب</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map(cat => (
            <Link key={cat._id} href={`/courses?category=${cat._id}`}>
              <Card className="hover:shadow-lg transition-shadow text-center">
                <CardContent className="p-4">
                  <div className="text-3xl mb-2">{cat.icon || '📚'}</div>
                  <span className="font-medium">{cat.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}