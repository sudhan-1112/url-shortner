const URL = require('../models/URL');
const Visit = require('../models/Visit');
const QRCode = require('qrcode');
const { Readable } = require('stream');
const csv = require('csv-parser');

// Helper to validate URL format
const isValidUrl = (urlString) => {
  try {
    const url = new global.URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

// Helper to generate a unique short code
const generateUniqueCode = async () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code exists in shortCode or customAlias
    const existingUrl = await URL.findOne({
      $or: [{ shortCode: code }, { customAlias: code }]
    });
    if (!existingUrl) {
      isUnique = true;
    }
  }
  return code;
};

// @desc    Create a shortened URL
// @route   POST /api/urls
// @access  Private
exports.createUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiryDate } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Please add a destination URL' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid URL format. Must start with http:// or https://' });
    }

    let shortCode;

    if (customAlias) {
      // Validate alias format (alphanumeric, dashes, underscores)
      const aliasRegex = /^[a-zA-Z0-9-_]+$/;
      if (!aliasRegex.test(customAlias)) {
        return res.status(400).json({ success: false, message: 'Alias can only contain letters, numbers, dashes, and underscores' });
      }

      // Check if alias is already in use
      const aliasExists = await URL.findOne({
        $or: [{ shortCode: customAlias }, { customAlias }]
      });
      if (aliasExists) {
        return res.status(400).json({ success: false, message: 'Custom alias is already in use' });
      }
      shortCode = customAlias;
    } else {
      shortCode = await generateUniqueCode();
    }

    // Generate short link for QR code
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const shortLink = `${baseUrl}/${shortCode}`;

    // Generate QR Code base64 data URL
    let qrCodeBase64 = '';
    try {
      qrCodeBase64 = await QRCode.toDataURL(shortLink, {
        color: {
          dark: '#1e293b', // Slate 800
          light: '#ffffff'
        },
        width: 300
      });
    } catch (qrError) {
      console.error('Failed to generate QR code', qrError);
    }

    const urlData = {
      userId: req.user.id,
      originalUrl,
      shortCode,
      qrCode: qrCodeBase64
    };

    if (customAlias) {
      urlData.customAlias = customAlias;
    }

    if (expiryDate) {
      urlData.expiryDate = new Date(expiryDate);
    }

    const url = await URL.create(urlData);

    res.status(201).json({
      success: true,
      data: url
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all URLs for logged in user (with Search, Pagination, Sorting)
// @route   GET /api/urls
// @access  Private
exports.getUrls = async (req, res, next) => {
  try {
    const { search, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user.id };

    // Search filter
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { customAlias: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination calculations
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sort = {};
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sort[sortBy] = order;
    } else {
      sort['createdAt'] = -1; // Default newest first
    }

    const total = await URL.countDocuments(query);
    const urls = await URL.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: urls.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      },
      data: urls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single URL details
// @route   GET /api/urls/:id
// @access  Private
exports.getUrlById = async (req, res, next) => {
  try {
    const url = await URL.findOne({ _id: req.params.id, userId: req.user.id });

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found' });
    }

    res.status(200).json({
      success: true,
      data: url
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a URL (Destination URL & Expiry Date)
// @route   PUT /api/urls/:id
// @access  Private
exports.updateUrl = async (req, res, next) => {
  try {
    const { originalUrl, expiryDate } = req.body;

    const url = await URL.findOne({ _id: req.params.id, userId: req.user.id });

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or unauthorized' });
    }

    if (originalUrl) {
      if (!isValidUrl(originalUrl)) {
        return res.status(400).json({ success: false, message: 'Invalid URL format. Must start with http:// or https://' });
      }
      url.originalUrl = originalUrl;
    }

    if (expiryDate !== undefined) {
      url.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    await url.save();

    res.status(200).json({
      success: true,
      data: url
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a URL
// @route   DELETE /api/urls/:id
// @access  Private
exports.deleteUrl = async (req, res, next) => {
  try {
    const url = await URL.findOne({ _id: req.params.id, userId: req.user.id });

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or unauthorized' });
    }

    // Delete associated visit logs
    await Visit.deleteMany({ shortCode: url.shortCode });
    if (url.customAlias) {
      await Visit.deleteMany({ shortCode: url.customAlias });
    }

    // Delete URL document
    await URL.deleteOne({ _id: url._id });

    res.status(200).json({
      success: true,
      message: 'URL and associated analytics deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk upload URLs via CSV
// @route   POST /api/urls/bulk
// @access  Private
exports.bulkUploadCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const records = [];
    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => records.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    const successList = [];
    const skippedList = [];

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    for (const record of records) {
      // Find case-insensitive keys: originalUrl, customAlias, expiryDate
      const originalUrl = record.originalUrl || record.originalurl || record.URL || record.url;
      const customAlias = record.customAlias || record.customalias || record.alias || record.Alias;
      const expiry = record.expiryDate || record.expirydate || record.expiry || record.Expiry;

      if (!originalUrl || !isValidUrl(originalUrl)) {
        skippedList.push({
          row: record,
          reason: 'Invalid or missing destination URL'
        });
        continue;
      }

      let shortCode;
      let aliasValue = customAlias ? customAlias.trim() : '';

      if (aliasValue) {
        const aliasRegex = /^[a-zA-Z0-9-_]+$/;
        if (!aliasRegex.test(aliasValue)) {
          skippedList.push({
            row: record,
            reason: 'Alias can only contain letters, numbers, dashes, and underscores'
          });
          continue;
        }

        const aliasExists = await URL.findOne({
          $or: [{ shortCode: aliasValue }, { customAlias: aliasValue }]
        });
        if (aliasExists) {
          skippedList.push({
            row: record,
            reason: `Alias '${aliasValue}' is already in use`
          });
          continue;
        }
        shortCode = aliasValue;
      } else {
        shortCode = await generateUniqueCode();
      }

      // Generate QR Code
      const shortLink = `${baseUrl}/${shortCode}`;
      let qrCodeBase64 = '';
      try {
        qrCodeBase64 = await QRCode.toDataURL(shortLink, {
          color: {
            dark: '#1e293b',
            light: '#ffffff'
          },
          width: 300
        });
      } catch (qrErr) {
        console.error('QR generation failed during bulk upload', qrErr);
      }

      const urlData = {
        userId: req.user.id,
        originalUrl,
        shortCode,
        qrCode: qrCodeBase64
      };

      if (aliasValue) {
        urlData.customAlias = aliasValue;
      }

      if (expiry) {
        const parsedDate = new Date(expiry);
        if (!isNaN(parsedDate.getTime())) {
          urlData.expiryDate = parsedDate;
        }
      }

      try {
        const urlObj = await URL.create(urlData);
        successList.push(urlObj);
      } catch (dbErr) {
        skippedList.push({
          row: record,
          reason: dbErr.message
        });
      }
    }

    res.status(200).json({
      success: true,
      summary: {
        totalProcessed: records.length,
        successCount: successList.length,
        skippedCount: skippedList.length
      },
      data: successList,
      skipped: skippedList
    });

  } catch (error) {
    next(error);
  }
};
