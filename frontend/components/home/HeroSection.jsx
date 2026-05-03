// components/home/HeroSection.jsx
'use client';
import { motion } from 'framer-motion'; // اختیاری – اگر نصب نیست حذف کنید
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
      <div className="container mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          EduNest – جایی که دانش لانه می‌سازد
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          بیش از ۱۰۰۰ دوره تخصصی در زمینه برنامه‌نویسی، طراحی، کسب و کار و ... با تدریس بهترین اساتید
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link href="/courses">
            <Button size="lg" className="text-lg px-8">مشاهده دوره‌ها</Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline" className="text-lg px-8">درباره ما</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}