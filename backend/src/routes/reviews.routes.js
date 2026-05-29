const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { getReviewsByGame, createReview, updateReview, deleteReview } = require('../controllers/reviews.controller');

router.get('/game/:gameId', getReviewsByGame);
router.post('/', authMiddleware, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;
