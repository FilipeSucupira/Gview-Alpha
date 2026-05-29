const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middlewares/auth');
const { listGameJams, getGameJam, createGameJam, updateGameJam, deleteGameJam, joinGameJam } = require('../controllers/gamejams.controller');

router.get('/', listGameJams);
router.get('/:id', getGameJam);
router.post('/', authMiddleware, adminOnly, createGameJam);
router.put('/:id', authMiddleware, adminOnly, updateGameJam);
router.delete('/:id', authMiddleware, adminOnly, deleteGameJam);
router.post('/:id/join', authMiddleware, joinGameJam);

module.exports = router;
