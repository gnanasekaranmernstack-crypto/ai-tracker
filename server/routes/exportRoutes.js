const express = require('express');
const router = express.Router();
const { exportPDF, exportExcel } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.get('/pdf', protect, exportPDF);
router.get('/excel', protect, exportExcel);

module.exports = router;
