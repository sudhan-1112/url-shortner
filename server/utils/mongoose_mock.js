const mongoose = require('mongoose');

const fs = require('fs');
const path = require('path');

module.exports = () => {
  const dbPath = path.join(__dirname, 'mock_db.json');

  // In-memory collections
  let users = [];
  let urls = [];
  let visits = [];
  let domains = [];

  // Helper to deep clone or return raw objects
  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  // Load persistent data on start
  const loadData = () => {
    try {
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        if (fileContent.trim()) {
          const data = JSON.parse(fileContent);
          users = data.users || [];
          urls = data.urls || [];
          visits = data.visits || [];
          domains = data.domains || [];
        }
      }
    } catch (err) {
      console.error('[MOCK DB] Failed to load persistent data:', err.message);
    }
  };

  // Save data to disk
  const saveData = () => {
    try {
      const data = { users, urls, visits, domains };
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('[MOCK DB] Failed to save persistent data:', err.message);
    }
  };

  loadData();

  // Override mongoose.connect
  mongoose.connect = async () => {
    console.log('[MOCK DB] Connection established to virtual in-memory store');
    return mongoose.connection;
  };

  // Pre-load schema files to register them in Mongoose before compile
  require('../models/User');
  require('../models/URL');
  require('../models/Visit');
  require('../models/Domain');

  const User = mongoose.model('User');
  const URLModel = mongoose.model('URL');
  const Visit = mongoose.model('Visit');
  const Domain = mongoose.model('Domain');

  // Define save for Domain model
  Domain.prototype.save = async function() {
    const data = this.toObject();
    const idx = domains.findIndex(d => d._id.toString() === this._id.toString());
    if (idx !== -1) {
      domains[idx] = clone(data);
    } else {
      domains.push(clone(data));
    }
    saveData();
    return this;
  };

  // Define save for URL model
  URLModel.prototype.save = async function() {
    const data = this.toObject();
    const idx = urls.findIndex(u => u._id.toString() === this._id.toString());
    if (idx !== -1) {
      urls[idx] = clone(data);
    } else {
      urls.push(clone(data));
    }
    saveData();
    return this;
  };

  // ---------------- MOCK USER STATIC METHODS ----------------
  User.findOne = async function(query) {
    if (query.email) {
      const emailMatch = query.email.toLowerCase();
      const rawUser = users.find(u => u.email.toLowerCase() === emailMatch);
      if (!rawUser) return null;
      
      // Return mongoose document with helper method
      const doc = new User(rawUser);
      doc.matchPassword = async function(enteredPassword) {
        return enteredPassword === rawUser.password || enteredPassword + 'hashed' === rawUser.password;
      };
      return doc;
    }
    return null;
  };

  User.create = async function(data) {
    const id = new mongoose.Types.ObjectId();
    const newUser = { _id: id, createdAt: new Date(), ...data };
    
    // Hash password mock
    if (newUser.password) {
      newUser.password = newUser.password + 'hashed'; // mock hash
    }
    
    users.push(clone(newUser));
    saveData();
    return new User(newUser);
  };

  User.findById = function(id) {
    const uid = id.toString();
    const rawUser = users.find(u => u._id.toString() === uid);
    
    const queryResult = {
      select: function(fields) {
        if (!rawUser) return null;
        const result = { ...rawUser };
        if (fields.includes('-password')) {
          delete result.password;
        }
        return new User(result);
      },
      exec: async function() {
        return rawUser ? new User(rawUser) : null;
      }
    };
    
    // Allow direct await on findById
    queryResult.then = (resolve) => resolve(queryResult.exec());
    return queryResult;
  };

  User.deleteOne = async function(query) {
    const idx = users.findIndex(u => u._id.toString() === query._id.toString());
    if (idx !== -1) {
      users.splice(idx, 1);
      saveData();
    }
    return { acknowledged: true, deletedCount: idx !== -1 ? 1 : 0 };
  };

  // ---------------- MOCK URL STATIC METHODS ----------------
  URLModel.findOne = async function(query) {
    let match = null;
    
    if (query._id && query.userId) {
      match = urls.find(u => u._id.toString() === query._id.toString() && u.userId.toString() === query.userId.toString());
    } else if (query.$and) {
      // Find default domains combining domain and code
      const domainPart = query.$and.find(q => q.$or && q.$or.some(i => i.domain !== undefined));
      const codePart = query.$and.find(q => q.$or && q.$or.some(i => i.shortCode !== undefined || i.customAlias !== undefined));
      
      if (domainPart && codePart) {
        const codes = codePart.$or.map(c => c.shortCode || c.customAlias);
        match = urls.find(u => {
          const matchesCode = codes.includes(u.shortCode) || codes.includes(u.customAlias);
          const matchesDomain = !u.domain;
          return matchesCode && matchesDomain;
        });
      }
    } else if (query.domain) {
      const qDomain = query.domain.toLowerCase();
      const codes = query.$or ? query.$or.map(q => q.shortCode || q.customAlias) : [];
      match = urls.find(u => {
        const matchesDomain = (u.domain || '').toLowerCase() === qDomain;
        const matchesCode = codes.includes(u.shortCode) || codes.includes(u.customAlias);
        return matchesDomain && matchesCode;
      });
    } else if (query.$or) {
      // Find by shortCode or customAlias
      const codes = query.$or.map(q => q.shortCode || q.customAlias);
      match = urls.find(u => codes.includes(u.shortCode) || codes.includes(u.customAlias));
    } else if (query.shortCode) {
      match = urls.find(u => u.shortCode === query.shortCode);
    } else if (query.customAlias) {
      match = urls.find(u => u.customAlias === query.customAlias);
    }
    
    if (!match) return null;
    return new URLModel(match);
  };

  URLModel.create = async function(data) {
    const id = new mongoose.Types.ObjectId();
    const newUrl = {
      _id: id,
      clickCount: 0,
      createdAt: new Date(),
      ...data
    };
    urls.push(clone(newUrl));
    saveData();
    return new URLModel(newUrl);
  };

  URLModel.countDocuments = async function(query) {
    return urls.filter(u => u.userId.toString() === query.userId.toString()).length;
  };

  URLModel.find = function(query) {
    let list = urls.filter(u => u.userId.toString() === query.userId.toString());
    
    // Apply search filter if present
    if (query.$or) {
      const searchTerms = query.$or.map(o => o.originalUrl?.$regex || o.shortCode?.$regex || '').filter(Boolean);
      if (searchTerms.length > 0) {
        const regex = new RegExp(searchTerms[0], 'i');
        list = list.filter(u => regex.test(u.originalUrl) || regex.test(u.shortCode) || (u.customAlias && regex.test(u.customAlias)));
      }
    }

    const queryResult = {
      sort: function() { return this; },
      skip: function() { return this; },
      limit: function() { return this; },
      exec: async function() {
        return list.map(item => new URLModel(item));
      }
    };

    queryResult.then = (resolve) => resolve(queryResult.exec());
    return queryResult;
  };

  URLModel.deleteOne = async function(query) {
    const idx = urls.findIndex(u => u._id.toString() === query._id.toString());
    if (idx !== -1) {
      urls.splice(idx, 1);
      saveData();
    }
    return { acknowledged: true, deletedCount: idx !== -1 ? 1 : 0 };
  };

  // ---------------- MOCK VISIT STATIC METHODS ----------------
  Visit.create = async function(data) {
    const id = new mongoose.Types.ObjectId();
    const newVisit = { _id: id, timestamp: new Date(), ...data };
    visits.push(clone(newVisit));
    saveData();
    return new Visit(newVisit);
  };

  Visit.countDocuments = async function(query) {
    return visits.filter(v => v.shortCode === query.shortCode).length;
  };

  Visit.findOne = function(query) {
    const list = visits.filter(v => v.shortCode === query.shortCode);
    
    const queryResult = {
      sort: function() { return this; },
      select: function() {
        return list[list.length - 1] || null; // Latest visit
      },
      exec: async function() {
        return list[list.length - 1] || null;
      }
    };

    queryResult.then = (resolve) => resolve(queryResult.exec());
    return queryResult;
  };

  Visit.find = function(query) {
    const list = visits.filter(v => v.shortCode === query.shortCode);
    
    const queryResult = {
      sort: function() { return this; },
      limit: function(n) {
        // Return last n items reversed
        return list.slice(-n).reverse().map(v => new Visit(v));
      },
      exec: async function() {
        return list.map(v => new Visit(v));
      }
    };

    queryResult.then = (resolve) => resolve(queryResult.exec());
    return queryResult;
  };

  Visit.deleteMany = async function(query) {
    let count = 0;
    for (let i = visits.length - 1; i >= 0; i--) {
      if (visits[i].shortCode === query.shortCode) {
        visits.splice(i, 1);
        count++;
      }
    }
    if (count > 0) {
      saveData();
    }
    return { acknowledged: true, deletedCount: count };
  };

  Visit.aggregate = async function(pipeline) {
    const match = pipeline[0].$match;
    const shortCode = match.shortCode;
    const list = visits.filter(v => v.shortCode === shortCode);

    const group = pipeline[1].$group;
    
    // Grouping by device
    if (group._id && group._id.$ifNull && group._id.$ifNull[0] === '$device') {
      const counts = {};
      list.forEach(v => {
        const d = v.device || 'Unknown';
        counts[d] = (counts[d] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({ _id: name, count }));
    }

    // Grouping by browser
    if (group._id && group._id.$ifNull && group._id.$ifNull[0] === '$browser') {
      const counts = {};
      list.forEach(v => {
        const b = v.browser || 'Unknown';
        counts[b] = (counts[b] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({ _id: name, count }));
    }

    // Grouping by country
    if (group._id && group._id.$ifNull && group._id.$ifNull[0] === '$country') {
      const counts = {};
      list.forEach(v => {
        const c = v.country || 'Unknown';
        counts[c] = (counts[c] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({ _id: name, count }));
    }

    // Grouping by city
    if (group._id && group._id.$ifNull && group._id.$ifNull[0] === '$city') {
      const counts = {};
      list.forEach(v => {
        const c = v.city || 'Unknown';
        counts[c] = (counts[c] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({ _id: name, count }));
    }

    // Grouping by date (Daily click trend)
    if (group._id && group._id.$dateToString) {
      const counts = {};
      list.forEach(v => {
        const dateStr = new Date(v.timestamp).toISOString().slice(0, 10);
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      });
      return Object.entries(counts).map(([date, count]) => ({ _id: date, count }));
    }

    return [];
  };

  // ---------------- MOCK DOMAIN STATIC METHODS ----------------
  Domain.create = async function(data) {
    const id = new mongoose.Types.ObjectId();
    const newDomain = {
      _id: id,
      isActive: true,
      createdAt: new Date(),
      ...data
    };
    domains.push(clone(newDomain));
    saveData();
    return new Domain(newDomain);
  };

  Domain.find = function(query) {
    let list = domains.filter(d => d.userId.toString() === query.userId.toString());
    
    const queryResult = {
      sort: function() { return this; },
      exec: async function() {
        return list.map(item => new Domain(item));
      }
    };
    queryResult.then = (resolve) => resolve(queryResult.exec());
    return queryResult;
  };

  Domain.findOne = async function(query) {
    let match = domains.find(d => {
      for (const key in query) {
        if (query[key] === undefined) continue;
        if (key === '_id' || key === 'userId') {
          if (d[key].toString() !== query[key].toString()) return false;
        } else {
          if (d[key] !== query[key]) return false;
        }
      }
      return true;
    });
    if (!match) return null;
    return new Domain(match);
  };

  Domain.deleteOne = async function(query) {
    const idx = domains.findIndex(d => d._id.toString() === query._id.toString());
    if (idx !== -1) {
      domains.splice(idx, 1);
      saveData();
    }
    return { acknowledged: true, deletedCount: idx !== -1 ? 1 : 0 };
  };

  Domain.updateMany = async function(query, update) {
    return { acknowledged: true };
  };
};
