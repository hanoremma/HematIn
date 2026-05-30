const express = require('express')

const router = express.Router()

const multer = require('multer')

const verifyToken =
  require('../middleware/authMiddleware');

const {

  addTransactionImage,
  getImage

} = require('../controllers/transactionImgController')

// =========================
// MULTER
// =========================
const upload = multer({

  storage: multer.memoryStorage()

})

// =========================
// CREATE IMAGE
// =========================
router.post(

  '/',

  upload.single('image'),

  verifyToken,
  addTransactionImage

)

// =========================
// GET IMAGE
// =========================
router.get(

  '/:id_transaction',

  verifyToken,
  getImage

)

module.exports = router