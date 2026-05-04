// frontend/app/page.js
import HeroSection from '@/components/home/HeroSection';
import CategoryList from '@/components/home/CategoryList';
import PopularCourses from '@/components/home/PopularCourses';
import LatestCourses from '@/components/home/LatestCourses';
import StatsSection from '@/components/home/StatsSection';
import { api } from '@/lib/api';

export default async function HomePage() {

  const [categories, popularCourses, latestCourses] = await Promise.all([
    api.categories.getAll().catch(() => []),
    api.courses.getPopular({ limit: 6 }).catch(() => ({ courses: [] })),
    api.courses.getAll({ limit: 6, sort: '-createdAt' }).catch(() => ({ courses: [] })),
  ]);

  return (
    <div className="overflow-hidden">
      <HeroSection />
      <CategoryList categories={categories} />
      <PopularCourses courses={popularCourses.courses || popularCourses} />
      <LatestCourses courses={latestCourses.courses || latestCourses} />
      <StatsSection />
    </div>
  );
}