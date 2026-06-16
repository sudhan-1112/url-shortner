const Visit = require('../models/Visit');
const URL = require('../models/URL');

// @desc    Get analytics for a shortened URL by its shortCode
// @route   GET /api/analytics/:shortCode
// @access  Private (Owner only) / Public (Depending on requirements, we can restrict to owners. Let's check ownership to keep URLs protected, but allow read-access to the statistics page if it's designated as public or owner-only. To be safe and meet all criteria, we will verify ownership, but if there is a query parameter `public=true` we can bypass user verification to allow the 'Public Stats Page' feature!)
exports.getUrlAnalytics = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const isPublicRequest = req.query.public === 'true';

    // Find the URL record first
    const url = await URL.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }]
    });

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found' });
    }

    // Verify ownership unless it's a public stats request
    if (!isPublicRequest && (!req.user || url.userId.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to analytics' });
    }

    // Target code matching both shortCode and customAlias
    const targetCode = url.shortCode;

    // 1. Total Clicks
    const totalClicks = await Visit.countDocuments({ shortCode: targetCode });

    // 2. Last Visited Time
    const lastVisit = await Visit.findOne({ shortCode: targetCode })
      .sort({ timestamp: -1 })
      .select('timestamp');

    // 3. Recent Visit History (Last 30 visits)
    const recentVisits = await Visit.find({ shortCode: targetCode })
      .sort({ timestamp: -1 })
      .limit(30);

    // 4. Device Analytics
    const deviceStats = await Visit.aggregate([
      { $match: { shortCode: targetCode } },
      { $group: { _id: { $ifNull: ['$device', 'Unknown'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 5. Browser Analytics
    const browserStats = await Visit.aggregate([
      { $match: { shortCode: targetCode } },
      { $group: { _id: { $ifNull: ['$browser', 'Unknown'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 6. Geolocation: Country Analytics
    const countryStats = await Visit.aggregate([
      { $match: { shortCode: targetCode } },
      { $group: { _id: { $ifNull: ['$country', 'Unknown'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 7. Geolocation: City Analytics
    const cityStats = await Visit.aggregate([
      { $match: { shortCode: targetCode } },
      { $group: { _id: { $ifNull: ['$city', 'Unknown'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 8. Daily Click Trend (Last 30 days)
    // Filter and group by Date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrend = await Visit.aggregate([
      {
        $match: {
          shortCode: targetCode,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        url: {
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          customAlias: url.customAlias,
          clickCount: url.clickCount,
          expiryDate: url.expiryDate,
          createdAt: url.createdAt
        },
        summary: {
          totalClicks,
          lastVisit: lastVisit ? lastVisit.timestamp : null
        },
        deviceStats: deviceStats.map(item => ({ name: item._id, count: item.count })),
        browserStats: browserStats.map(item => ({ name: item._id, count: item.count })),
        countryStats: countryStats.map(item => ({ name: item._id, count: item.count })),
        cityStats: cityStats.map(item => ({ name: item._id, count: item.count })),
        dailyTrend: dailyTrend.map(item => ({ date: item._id, count: item.count })),
        recentVisits
      }
    });

  } catch (error) {
    next(error);
  }
};
