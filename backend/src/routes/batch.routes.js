const express = require('express');
const { getBatches, getBatchById, approveBatch } = require('../controllers/batchController');

const router = express.Router();

router.get('/', getBatches);
router.get('/:id', getBatchById);
router.post('/:id/approve', approveBatch);

module.exports = router;
