const express = require('express');

const router = express.Router();

const {

  getDashboard,
  getAnalytics

} = require('../controllers/dashboardController');

// =========================
// ANALYTICS
// =========================
router.get(
  '/analytics/:id_user',
  getAnalytics
);

// =========================
// DASHBOARD SUMMARY
// =========================
router.get(
  '/:id_user',
  getDashboard
);

module.exports = router;