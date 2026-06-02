const express =
require('express');

const router =
express.Router();

const verifyToken =
require('../middleware/authMiddleware');

const {

  getRecommendation

} = require(
  '../controllers/recommendationController'
);

router.get(
  '/',
  verifyToken,
  getRecommendation
);

module.exports =
router;