require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const useragent = require('express-useragent');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const URL = require('./models/URL');
const Visit = require('./models/Visit');

// Connect to Database
connectDB();

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Turn off CSP check for easier API calls during dev
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse User-Agent
app.use(useragent.express());

// Sanitize data (MongoDB injection protection)
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Rate Limiting: limit 300 requests per 15 minutes from an IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes'
  }
});
app.use('/api/', limiter);

// Mount API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/urls', require('./routes/urls'));
app.use('/api/analytics', require('./routes/analytics'));

// Asynchronous background visit logger
const logVisit = async (shortCode, req) => {
  try {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    let ip = rawIp.split(',')[0].trim();
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    }

    const browser = req.useragent.browser || 'Unknown';
    // Clean device type mapping
    let device = 'Desktop';
    if (req.useragent.isMobile) device = 'Mobile';
    else if (req.useragent.isTablet) device = 'Tablet';
    else if (req.useragent.isBot) device = 'Bot';

    let country = 'Unknown';
    let city = 'Unknown';

    // Localhost simulation for geo analytics presentation
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      const mockLocations = [
        { country: 'United States', city: 'New York' },
        { country: 'India', city: 'Mumbai' },
        { country: 'United Kingdom', city: 'London' },
        { country: 'Germany', city: 'Berlin' },
        { country: 'Canada', city: 'Toronto' },
        { country: 'Australia', city: 'Sydney' },
        { country: 'Japan', city: 'Tokyo' }
      ];
      const selected = mockLocations[Math.floor(Math.random() * mockLocations.length)];
      country = selected.country;
      city = selected.city;
    } else {
      try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        if (data.status === 'success') {
          country = data.country || 'Unknown';
          city = data.city || 'Unknown';
        }
      } catch (err) {
        console.error('GeoIP lookup failed:', err.message);
      }
    }

    await Visit.create({
      shortCode,
      ipAddress: ip,
      browser,
      device,
      country,
      city
    });
  } catch (err) {
    console.error('Background logging failed:', err.message);
  }
};

// GET /:shortCode (Server-side Redirect)
app.get('/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Skip redirect logic for base path (e.g. check API live status or ignore)
    if (shortCode === 'favicon.ico') {
      return res.status(204).end();
    }

    const url = await URL.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }]
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!url) {
      return res.redirect(`${clientUrl}/404`);
    }

    // Expiry check
    if (url.expiryDate && new Date(url.expiryDate) < new Date()) {
      return res.redirect(`${clientUrl}/expired`);
    }

    // Increment click count
    url.clickCount += 1;
    await url.save();

    // Log the visit details asynchronously in the background
    logVisit(url.shortCode, req);

    // Perform redirect to original long URL
    res.redirect(url.originalUrl);
  } catch (error) {
    next(error);
  }
});

// App Health Check / Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'URL Shortener Pro API is running...' });
});

// Load global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in mode on port ${PORT}`);
});
