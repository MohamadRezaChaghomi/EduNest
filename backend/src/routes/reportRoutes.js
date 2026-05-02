const express = require('express');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  createReport,
  getReports,
  resolveReport,
  deleteReport,
} = require('../controllers/reportController');

const router = express.Router();

router.route('/')
  .post(protect, createReport)          // کاربران عادی می‌توانند گزارش بدهند
  .get(protect, adminOnly, getReports); // فقط ادمین لیست گزارش‌ها را ببیند

router.route('/:id')
  .put(protect, adminOnly, resolveReport)
  .delete(protect, adminOnly, deleteReport);

module.exports = router;