const express = require('express');
const router = express.Router();
const { getTools, addTool, updateTool, deleteTool } = require('../controllers/toolController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getTools)
  .post(protect, addTool);

router.route('/:id')
  .put(protect, updateTool)
  .delete(protect, deleteTool);

module.exports = router;
