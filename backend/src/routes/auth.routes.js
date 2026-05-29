const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { register, login, getMe, updateMe, deleteMe } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.delete('/me', authMiddleware, deleteMe);

module.exports = router;
