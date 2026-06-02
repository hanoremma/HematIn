const express = require('express')

const {

  register,
  login,
  getProfile,
  updateProfile,
  verifyEmail

} = require('../controllers/authController')

const verifyToken =
require('../middleware/authMiddleware')

const router = express.Router()

// =========================
// REGISTER
// =========================
router.post(
  '/register',
  register
)

// =========================
// LOGIN
// =========================
router.post(
  '/login',
  login
)

// =========================
// VERIFY EMAIL
// =========================
router.get(
  '/verify/:token',
  verifyEmail
)

// =========================
// GET PROFILE
// =========================
router.get(
  '/profile',
  verifyToken,
  getProfile
)

// =========================
// UPDATE PROFILE
// =========================
router.put(
  '/profile',
  verifyToken,
  updateProfile
)

module.exports = router