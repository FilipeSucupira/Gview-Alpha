const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middlewares/auth');
const { listUsers, updateUserRole } = require('../controllers/users.controller');

router.get('/', authMiddleware, adminOnly, listUsers);
router.patch('/:id/role', authMiddleware, adminOnly, updateUserRole);

module.exports = router;
