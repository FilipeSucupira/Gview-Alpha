const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middlewares/auth');
const { listSubmissions, getSubmission, createSubmission, updateSubmissionStatus, updateSubmission, deleteSubmission } = require('../controllers/submissions.controller');

router.get('/', authMiddleware, adminOnly, listSubmissions);
router.get('/:id', authMiddleware, adminOnly, getSubmission);
router.post('/', authMiddleware, createSubmission);
router.patch('/:id/status', authMiddleware, adminOnly, updateSubmissionStatus);
router.put('/:id', authMiddleware, adminOnly, updateSubmission);
router.delete('/:id', authMiddleware, adminOnly, deleteSubmission);

module.exports = router;
