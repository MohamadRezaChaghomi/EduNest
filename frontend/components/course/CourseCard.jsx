import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CourseCard({ course }) {
  const discountPrice = course.discountPrice || course.price;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  return (
    <Link href={`/course/${course.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative w-full h-48">
            <Image
              src={course.coverImage || '/default-course.jpg'}
              alt={course.title}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{course.shortDescription || course.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">{course.level === 'beginner' ? 'مبتدی' : course.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}</Badge>
            <Badge variant="outline">{course.category?.name}</Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-green-600">{discountPrice.toLocaleString()} تومان</span>
                <span className="text-sm line-through text-gray-400">{course.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-lg font-bold">{course.price.toLocaleString()} تومان</span>
            )}
          </div>
          <div className="text-sm text-yellow-500">⭐ {course.ratingAverage || 0}</div>
        </CardFooter>
      </Card>
    </Link>
  );
}