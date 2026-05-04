// components/course/CourseCard.jsx
import Link from 'next/link';
import Image from 'next/image'; // (Fixed: import Next.js Image component)
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';

export default function CourseCard({ course }) {
  const finalPrice = course.discountPrice || course.price;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {/* (Fixed: replace <img> with Next.js <Image> component) */}
          <Image
            src={course.coverImage || '/default-course.jpg'}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          {course.level && (
            <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground">
              {course.level === 'beginner' ? 'مبتدی' : course.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}
            </Badge>
          )}
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2 text-sm">{course.shortDescription}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users size={14} /> {course.enrolledCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {course.duration || 0} دقیقه
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div>
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">{finalPrice.toLocaleString()}</span>
                <span className="text-sm line-through text-muted-foreground">{course.price.toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary">{finalPrice.toLocaleString()} تومان</span>
            )}
          </div>
          <Badge variant="outline" className="border-primary/30">مشاهده دوره</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}