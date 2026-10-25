const express = require('express');
const upload = require('../middlewares/upload.middleware');
const { uploadCsv, downloadSampleCsv, generateCsv } = require('../controllers/uploadController');

const router = express.Router();

router.post('/upload', upload.single('file'), uploadCsv);
router.get('/sample-csv', downloadSampleCsv);
router.get('/generate-csv', generateCsv);

module.exports = router;

