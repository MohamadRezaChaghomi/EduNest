import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 text-foreground">EduNest</h3>
            <p className="text-sm text-muted-foreground">
              پلتفرم تخصصی آموزش آنلاین با بیش از ۱۰۰۰ دوره تخصصی در حوزه برنامه‌نویسی، طراحی و کسب و کار.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses" className="text-muted-foreground hover:text-primary transition">دوره‌ها</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition">درباره ما</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition">تماس با ما</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">قوانین</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition">شرایط استفاده</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition">حریم خصوصی</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">تماس</h4>
            <p className="text-sm text-muted-foreground">ایمیل: info@edunest.com</p>
            <p className="text-sm text-muted-foreground">تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</p>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} EduNest. تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}