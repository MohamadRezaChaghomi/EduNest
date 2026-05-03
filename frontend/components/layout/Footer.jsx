import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">EduNest</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              پلتفرم تخصصی آموزش آنلاین با بیش از ۱۰۰۰ دوره تخصصی در حوزه برنامه‌نویسی، طراحی و کسب و کار.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses" className="hover:text-primary">دوره‌ها</Link></li>
              <li><Link href="/about" className="hover:text-primary">درباره ما</Link></li>
              <li><Link href="/contact" className="hover:text-primary">تماس با ما</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">قوانین</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-primary">شرایط استفاده</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">حریم خصوصی</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">تماس</h4>
            <p className="text-sm">ایمیل: info@edunest.com</p>
            <p className="text-sm">تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</p>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} EduNest. تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}