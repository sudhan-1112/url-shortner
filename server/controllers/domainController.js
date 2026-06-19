const Domain = require('../models/Domain');
const URL = require('../models/URL');

// Helper to validate domain format (simple regex check for domain name, e.g. brand.com or short.brand.com)
const isValidDomainFormat = (domain) => {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-0][a-z0-9-]{0,61}[a-z0-9]$/;
  // Allow localhost or standard domains
  if (domain === 'localhost') return true;
  return domainRegex.test(domain);
};

// @desc    Register a custom domain
// @route   POST /api/domains
// @access  Private
exports.createDomain = async (req, res, next) => {
  try {
    let { domainName } = req.body;

    if (!domainName) {
      return res.status(400).json({ success: false, message: 'Please add a domain name' });
    }

    domainName = domainName.trim().toLowerCase();

    if (!isValidDomainFormat(domainName)) {
      return res.status(400).json({ success: false, message: 'Invalid domain format. Example: brand.com or short.brand.com' });
    }

    // Check if domain is already registered (domains are globally unique)
    const domainExists = await Domain.findOne({ domainName });
    if (domainExists) {
      return res.status(400).json({ success: false, message: 'Domain is already registered' });
    }

    const domain = await Domain.create({
      userId: req.user.id,
      domainName,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: domain
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's custom domains
// @route   GET /api/domains
// @access  Private
exports.getDomains = async (req, res, next) => {
  try {
    const domains = await Domain.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: domains.length,
      data: domains
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle custom domain status (Active/Inactive)
// @route   PUT /api/domains/:id
// @access  Private
exports.toggleDomainStatus = async (req, res, next) => {
  try {
    const domain = await Domain.findOne({ _id: req.params.id, userId: req.user.id });

    if (!domain) {
      return res.status(404).json({ success: false, message: 'Domain not found or unauthorized' });
    }

    domain.isActive = !domain.isActive;
    await domain.save();

    res.status(200).json({
      success: true,
      data: domain
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a custom domain
// @route   DELETE /api/domains/:id
// @access  Private
exports.deleteDomain = async (req, res, next) => {
  try {
    const domain = await Domain.findOne({ _id: req.params.id, userId: req.user.id });

    if (!domain) {
      return res.status(404).json({ success: false, message: 'Domain not found or unauthorized' });
    }

    // Optional: We could update all URLs associated with this domain to use no domain (fallback to default)
    await URL.updateMany({ domain: domain.domainName }, { $set: { domain: '' } });

    await Domain.deleteOne({ _id: domain._id });

    res.status(200).json({
      success: true,
      message: 'Domain deleted. Associated URLs fell back to default domain.'
    });
  } catch (error) {
    next(error);
  }
};
