const { spawn } = require('child_process');
const path = require('path');

// Configuration
const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;
const API_URL = `${BASE_URL}/api`;

let serverProcess = null;

// Helper to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to print test outputs
const printResult = (testName, passed, details = '') => {
  if (passed) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
  }
};

// Start backend server in background
const startServer = () => {
  return new Promise((resolve, reject) => {
    console.log('Starting backend server for test verification...');
    const serverPath = path.join(__dirname, '..', 'server.js');
    
    serverProcess = spawn('node', [serverPath], {
      env: { ...process.env, PORT: PORT, MONGODB_URI: 'mock' }
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running')) {
        console.log('Server is running and listening.');
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Stderr: ${data.toString()}`);
    });

    serverProcess.on('error', (err) => {
      reject(err);
    });

    // Timeout fallback after 4 seconds
    delay(4000).then(resolve);
  });
};

// Main test execution suite
const runTests = async () => {
  let token = '';
  let testUrlId = '';
  let email = `tester_${Date.now()}@example.com`;
  let password = 'password123';

  console.log('\n--- Beginning Test Suite ---\n');

  // Test 1: App Health Endpoint
  try {
    const res = await fetch(`${BASE_URL}/`);
    const data = await res.json();
    printResult('Health Check Endpoint', res.ok && data.success === true);
  } catch (err) {
    printResult('Health Check Endpoint', false, err.message);
    return false;
  }

  // Test 2: User Registration
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automation Tester',
        email,
        password,
        confirmPassword: password
      })
    });
    const data = await res.json();
    token = data.token;
    printResult('User Registration API', res.status === 201 && data.success === true && !!token);
  } catch (err) {
    printResult('User Registration API', false, err.message);
    return false;
  }

  // Test 3: User Login
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    printResult('User Login API', res.status === 200 && data.success === true && data.token === token);
  } catch (err) {
    printResult('User Login API', false, err.message);
    return false;
  }

  // Test 4: Get Profile (Authenticated check)
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    printResult('User Profile API', res.ok && data.data.email === email);
  } catch (err) {
    printResult('User Profile API', false, err.message);
    return false;
  }

  // Test 5: Create URL with Custom Alias
  const customAlias = `test-alias-${Date.now()}`;
  try {
    const res = await fetch(`${API_URL}/urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        originalUrl: 'https://example.com/automation-target',
        customAlias
      })
    });
    const data = await res.json();
    if (res.status !== 201) {
      console.error('URL Creation Failed Response:', JSON.stringify(data));
    }
    testUrlId = data.data?._id;
    printResult('Create Short URL API', res.status === 201 && data.data?.shortCode === customAlias && !!data.data?.qrCode);
  } catch (err) {
    printResult('Create Short URL API', false, err.message);
    return false;
  }

  // Test 6: URL Redirection and Click Logging
  try {
    // Disable automatic redirect follow to inspect response headers
    const res = await fetch(`${BASE_URL}/${customAlias}`, { redirect: 'manual' });
    const location = res.headers.get('location');
    printResult('Redirect Flow (HTTP 302)', res.status === 302 && location === 'https://example.com/automation-target');
  } catch (err) {
    printResult('Redirect Flow (HTTP 302)', false, err.message);
    return false;
  }

  // Wait a moment for background click logging to complete
  await delay(1500);

  // Test 7: Analytics Gathering
  try {
    const res = await fetch(`${API_URL}/analytics/${customAlias}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const metrics = data.data;
    printResult(
      'Analytics Fetching API',
      res.ok && 
      metrics.summary.totalClicks === 1 && 
      metrics.deviceStats.length > 0 &&
      metrics.recentVisits.length === 1
    );
  } catch (err) {
    printResult('Analytics Fetching API', false, err.message);
    return false;
  }

  // Test 8: Delete Short URL
  try {
    const res = await fetch(`${API_URL}/urls/${testUrlId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    printResult('Delete URL API', res.ok && data.success === true);
  } catch (err) {
    printResult('Delete URL API', false, err.message);
    return false;
  }

  console.log('\n--- All Automated API Endpoint Tests Passed ---');
  return true;
};

// Run script
const main = async () => {
  try {
    await startServer();
    const passed = await runTests();
    
    // Stop server
    if (serverProcess) {
      console.log('Shutting down backend server...');
      serverProcess.kill();
    }
    
    process.exit(passed ? 0 : 1);
  } catch (err) {
    console.error('Critical test error:', err);
    if (serverProcess) serverProcess.kill();
    process.exit(1);
  }
};

main();
