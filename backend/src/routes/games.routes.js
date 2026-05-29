const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middlewares/auth');
const { listGames, getGameBySlug, getGameById, createGame, updateGame, deleteGame } = require('../controllers/games.controller');

router.get('/', listGames);
router.get('/id/:id', getGameById);
router.get('/:slug', getGameBySlug);
router.post('/', authMiddleware, adminOnly, createGame);
router.put('/:id', authMiddleware, adminOnly, updateGame);
router.delete('/:id', authMiddleware, adminOnly, deleteGame);

module.exports = router;
