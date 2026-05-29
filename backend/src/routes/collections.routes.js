const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { listCollections, getCollection, createCollection, updateCollection, deleteCollection, addGameToCollection, removeGameFromCollection } = require('../controllers/collections.controller');

router.get('/my', authMiddleware, listCollections);
router.get('/user/:userId', getCollection);
router.get('/:id', authMiddleware, getCollection);
router.post('/', authMiddleware, createCollection);
router.put('/:id', authMiddleware, updateCollection);
router.delete('/:id', authMiddleware, deleteCollection);
router.post('/:id/games', authMiddleware, addGameToCollection);
router.delete('/:id/games/:gameId', authMiddleware, removeGameFromCollection);

module.exports = router;
