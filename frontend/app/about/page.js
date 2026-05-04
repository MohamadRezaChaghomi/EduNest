// app/about/page.js
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award, Clock, TrendingUp, GraduationCap, Headphones } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'درباره ما | EduNest',
  description: 'آشنایی با EduNest، پلتفرم تخصصی آموزش آنلاین',
};

export default function AboutPage() {
  const features = [
    {
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      title: 'دوره‌های تخصصی',
      description: 'با تدریس برترین اساتید و به‌روزترین سرفصل‌ها',
    },
    {
      icon: <Headphones className="w-8 h-8 text-primary" />,
      title: 'پشتیبانی ۲۴ ساعته',
      description: 'پاسخگویی سریع به سوالات و مشکلات شما',
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: 'گواهی پایان دوره',
      description: 'دریافت گواهی معتبر پس از اتمام دوره',
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: 'به‌روزرسانی مداوم',
      description: 'محتواهای دائماً بروز و مطابق با نیاز بازار',
    },
  ];

  const stats = [
    { value: '۱۰۰۰+', label: 'دوره تخصصی' },
    { value: '۵۰۰۰+', label: 'دانشجو فعال' },
    { value: '۱۵۰+', label: 'مدرس مجرب' },
    { value: '۹۸٪', label: 'رضایت کاربران' },
  ];

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            درباره <span className="text-primary">EduNest</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            پلتفرمی برای یادگیری بدون مرز، با هدف توانمندسازی نیروی انسانی دیجیتال ایران
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">چشم‌انداز ما</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            تبدیل شدن به بزرگترین و معتبرترین بستر آموزش آنلاین در ایران و ایجاد فرصت‌های برابر یادگیری
            برای همه، بدون محدودیت جغرافیایی و اقتصادی.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            چرا <span className="text-primary">EduNest</span>؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">داستان ما</h2>
          <div className="prose prose-lg dark:prose-invert mx-auto text-muted-foreground space-y-4">
            <p>
              EduNest در سال ۱۴۰۰ با هدف پر کردن شکاف بین آموزش‌های آکادمیک و نیازهای واقعی بازار کار تأسیس شد.
              ما معتقدیم یادگیری باید همیشه در دسترس، جذاب و کاربردی باشد.
            </p>
            <p>
              امروز، هزاران دانشجو و مدرس در سراسر ایران به جامعه EduNest پیوسته‌اند و با هم در حال ساختن
              آینده‌ای روشن‌تر برای آموزش آنلاین هستیم.
            </p>
          </div>
          <div className="text-center mt-10">
            <Link href="/courses">
              <Button size="lg" className="shadow-lg hover:shadow-xl transition">
                شروع یادگیری
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}