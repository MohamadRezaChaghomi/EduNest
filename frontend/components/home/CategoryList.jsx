import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function CategoryList({ categories }) {
  if (!categories?.length) return null;

  return (
    <section className="py-16 bg-background border-y border-border" dir="rtl">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
          دسته‌بندی‌های محبوب
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((cat) => (
            <Link key={cat._id} href={`/courses?category=${cat._id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 text-center cursor-pointer border-border">
                <CardContent className="p-4">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {cat.icon || '📚'}
                  </div>
                  <span className="font-medium text-foreground">{cat.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}