// در orderController.js
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'دوره یافت نشد' });
    // بررسی اینکه کاربر قبلاً ثبت نام نکرده باشد
    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'شما قبلاً در این دوره ثبت نام کرده‌اید' });
    }
    // ایجاد سفارش (با فرض پرداخت موفق - موقت)
    const order = await Order.create({
      user: req.user.id,
      items: [{ course: courseId, price: course.discountPrice || course.price }],
      totalAmount: course.price,
      discountTotal: course.discountPrice ? course.price - course.discountPrice : 0,
      finalAmount: course.discountPrice || course.price,
      status: 'paid',
      paidAt: new Date(),
    });
    // اضافه کردن کاربر به لیست دانشجویان دوره
    course.students.push(req.user.id);
    course.enrolledCount = course.students.length;
    await course.save();
    res.status(201).json({ message: 'ثبت نام با موفقیت انجام شد', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};