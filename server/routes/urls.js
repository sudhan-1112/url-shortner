const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createUrl,
  getUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  bulkUploadCsv
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');

// Setup Multer for CSV upload in-memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 2 } // Limit 2MB CSV files
});

router.route('/')
  .post(protect, createUrl)
  .get(protect, getUrls);

router.route('/bulk')
  .post(protect, upload.single('file'), bulkUploadCsv);

router.route('/:id')
  .get(protect, getUrlById)
  .put(protect, updateUrl)
  .delete(protect, deleteUrl);

module.exports = router;
