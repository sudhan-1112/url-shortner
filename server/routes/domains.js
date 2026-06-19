const express = require('express');
const router = express.Router();
const {
  createDomain,
  getDomains,
  toggleDomainStatus,
  deleteDomain
} = require('../controllers/domainController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createDomain)
  .get(protect, getDomains);

router.route('/:id')
  .put(protect, toggleDomainStatus)
  .delete(protect, deleteDomain);

module.exports = router;
