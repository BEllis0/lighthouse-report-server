const router = require('express').Router();
const reportController = require('../controllers/report-controller.js');

// all reports
router.get('/all', reportController.all_reports);

module.exports = router;