const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');

router.get('/:userId', authMiddleware, getWishlist);
router.post('/', authMiddleware, addToWishlist);
router.delete('/:gameId', authMiddleware, removeFromWishlist);

module.exports = router;
