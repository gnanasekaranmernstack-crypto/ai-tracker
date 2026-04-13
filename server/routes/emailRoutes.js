const express = require('express');
const router = express.Router();
const { getEmails, addEmail, updateEmail, deleteEmail } = require('../controllers/emailController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getEmails)
  .post(protect, addEmail);

router.route('/:id')
  .put(protect, updateEmail)
  .delete(protect, deleteEmail);

module.exports = router;
