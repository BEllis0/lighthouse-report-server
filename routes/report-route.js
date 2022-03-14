const router = require('express').Router();
const reportController = require('../controllers/report-controller.js');

// all reports
router.get('/all-metrics/page', reportController.all_metrics.page);
router.get('/network-calls/all', reportController.network_calls.all);

module.exports = router;