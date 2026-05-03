// app/about/page.js
export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">درباره EduNest</h1>
      <div className="prose prose-lg dark:prose-invert mx-auto">
        <p>
          EduNest یک پلتفرم آموزش آنلاین است که با هدف ارائه دوره‌های باکیفیت و به‌روز در حوزه‌های برنامه‌نویسی، طراحی، کسب‌وکار و مهارت‌های دیجیتال تأسیس شده است.
        </p>
        <h2>چرا EduNest؟</h2>
        <ul>
          <li>دوره‌های تخصصی با تدریس برترین اساتید</li>
          <li>پشتیبانی ۲۴ ساعته و پاسخگویی سریع</li>
          <li>گواهی پایان دوره معتبر</li>
          <li>به‌روزرسانی مداوم محتوا</li>
        </ul>
        <h2>چشم‌انداز ما</h2>
        <p>
          تبدیل شدن به بزرگترین بستر آموزش آنلاین در ایران و ایجاد فرصت‌های برابر یادگیری برای همه.
        </p>
      </div>
    </div>
  );
}