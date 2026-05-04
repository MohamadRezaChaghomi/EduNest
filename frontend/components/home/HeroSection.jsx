// components/home/HeroSection.jsx
'use client';
import { motion } from 'framer-motion'; // در صورت نبودن، خط زیر را از کامنت خارج کنید و کتابخانه را نصب کنید
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-background py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold mb-4 text-foreground"
        >
          EduNest – جایی که دانش لانه می‌سازد
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          بیش از ۱۰۰۰ دوره تخصصی در زمینه برنامه‌نویسی، طراحی، کسب و کار و ... با تدریس بهترین اساتید
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link href="/courses">
            <Button size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition">
              مشاهده دوره‌ها
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline" className="text-lg px-8">
              درباره ما
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}