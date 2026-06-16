import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  ArrowLeftIcon,
  CalendarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsPage = () => {
  const { shortCode } = useParams();
  const [searchParams] = useSearchParams();
  const isPublic = searchParams.get('public') === 'true';
  const { theme } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get(`/analytics/${shortCode}`, {
          params: { public: isPublic }
        });
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics details');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [shortCode, isPublic]);

  const handleCopy = () => {
    const baseUrl = window.location.origin.includes('localhost')
      ? 'http://localhost:5000'
      : window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/${shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-350 border-t-indigo-650 dark:border-slate-800 dark:border-t-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-600 dark:text-rose-400">
          <h2 className="font-heading text-xl font-bold mb-2">Error Loading Analytics</h2>
          <p className="text-sm">{error}</p>
        </div>
        <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Chart 1: Daily Trend Line Chart
  const trendLabels = data.dailyTrend.map(item => item.date);
  const trendCounts = data.dailyTrend.map(item => item.count);

  const trendChartData = {
    labels: trendLabels.length > 0 ? trendLabels : ['No recent visits'],
    datasets: [
      {
        fill: true,
        label: 'Clicks',
        data: trendCounts.length > 0 ? trendCounts : [0],
        borderColor: '#6366f1', // Indigo 500
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: '#6366f1'
      }
    ]
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { padding: 12, cornerRadius: 8 }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: 'Inter' } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Inter' }, stepSize: 1 },
        beginAtZero: true
      }
    }
  };

  // Chart 2: Devices Doughnut Chart
  const deviceLabels = data.deviceStats.map(item => item.name);
  const deviceCounts = data.deviceStats.map(item => item.count);

  const deviceChartData = {
    labels: deviceLabels.length > 0 ? deviceLabels : ['No data'],
    datasets: [
      {
        data: deviceCounts.length > 0 ? deviceCounts : [1],
        backgroundColor: [
          '#6366f1', // Indigo
          '#10b981', // Emerald
          '#f59e0b', // Amber
          '#3b82f6', // Blue
          '#ec4899'  // Pink
        ],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f172a' : '#ffffff'
      }
    ]
  };

  const deviceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: textColor, font: { family: 'Inter', size: 12 }, boxWidth: 12 }
      }
    }
  };

  // Chart 3: Browsers Doughnut Chart
  const browserLabels = data.browserStats.map(item => item.name);
  const browserCounts = data.browserStats.map(item => item.count);

  const browserChartData = {
    labels: browserLabels.length > 0 ? browserLabels : ['No data'],
    datasets: [
      {
        data: browserCounts.length > 0 ? browserCounts : [1],
        backgroundColor: [
          '#a855f7', // Purple
          '#14b8a6', // Teal
          '#ef4444', // Red
          '#f43f5e', // Rose
          '#06b6d4'  // Cyan
        ],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f172a' : '#ffffff'
      }
    ]
  };

  // Chart 4: Geolocation Country Bar Chart
  const countryLabels = data.countryStats.map(item => item.name);
  const countryCounts = data.countryStats.map(item => item.count);

  const countryChartData = {
    labels: countryLabels.length > 0 ? countryLabels : ['No data'],
    datasets: [
      {
        label: 'Clicks',
        data: countryCounts.length > 0 ? countryCounts : [0],
        backgroundColor: '#8b5cf6', // Violet 500
        borderRadius: 8
      }
    ]
  };

  const countryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: 'Inter' } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Inter' }, stepSize: 1 },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          to={isPublic ? '/' : '/dashboard'}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeftIcon className="h-4 w-4" /> {isPublic ? 'Back to Home' : 'Back to Dashboard'}
        </Link>
      </div>

      {/* Main Title & Action Panel */}
      <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-900/30 dark:text-indigo-400">
              Active Short URL
            </span>
            {isPublic && (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-900/30 dark:text-emerald-400">
                Public Stats Page
              </span>
            )}
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white truncate">
            /{shortCode}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
            Destination: <a href={data.url.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-medium">{data.url.originalUrl}</a>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-0.5">
            Short URL: <a href={`http://localhost:5000/${shortCode}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400 font-medium">http://localhost:5000/{shortCode}</a>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850"
          >
            {copied ? (
              <>
                <ClipboardDocumentCheckIcon className="h-5 w-5 text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardIcon className="h-5 w-5" />
                Copy Link
              </>
            )}
          </button>

          {!isPublic && (
            <Link
              to={`/analytics/${shortCode}?public=true`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <GlobeAltIcon className="h-5 w-5" />
              Public Link
            </Link>
          )}
        </div>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="glass rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Click Reach</p>
          <p className="font-heading text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {data.summary.totalClicks}
          </p>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Visited Time</p>
          <p className="font-heading text-lg font-bold text-slate-900 dark:text-white mt-3.5">
            {data.summary.lastVisit ? new Date(data.summary.lastVisit).toLocaleString() : 'No visits recorded'}
          </p>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Created Date</p>
          <p className="font-heading text-lg font-bold text-slate-900 dark:text-white mt-3.5">
            {new Date(data.url.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
        {/* Daily Trend Line Chart (Main, spans 2 cols) */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 lg:col-span-2">
          <h3 className="font-heading text-md font-semibold text-slate-900 dark:text-white mb-4">
            Daily Click Trend
          </h3>
          <div className="h-72">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </div>

        {/* Device Distribution */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <h3 className="font-heading text-md font-semibold text-slate-900 dark:text-white mb-4">
            Device Breakdown
          </h3>
          <div className="h-72 flex items-center justify-center">
            {data.deviceStats.length > 0 ? (
              <Doughnut data={deviceChartData} options={deviceChartOptions} />
            ) : (
              <p className="text-sm text-slate-500">No device data available</p>
            )}
          </div>
        </div>

        {/* Geolocation Country Chart */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 lg:col-span-2">
          <h3 className="font-heading text-md font-semibold text-slate-900 dark:text-white mb-4">
            Geolocation: Country
          </h3>
          <div className="h-72">
            {data.countryStats.length > 0 ? (
              <Bar data={countryChartData} options={countryChartOptions} />
            ) : (
              <p className="text-sm text-slate-500 flex h-full items-center justify-center">No location data available</p>
            )}
          </div>
        </div>

        {/* Browser Shares */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <h3 className="font-heading text-md font-semibold text-slate-900 dark:text-white mb-4">
            Browser Share
          </h3>
          <div className="h-72 flex items-center justify-center">
            {data.browserStats.length > 0 ? (
              <Doughnut data={browserChartData} options={deviceChartOptions} />
            ) : (
              <p className="text-sm text-slate-500">No browser data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Geolocation City breakdown + Recent visits list */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* City Breakdown */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <h3 className="font-heading text-md font-semibold text-slate-900 dark:text-white mb-4">
            City Breakdown
          </h3>
          {data.cityStats.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto pr-1">
              {data.cityStats.map((item, idx) => (
                <div key={idx} className="flex justify-between py-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-350">{item.name}</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.count} clicks</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-10 text-center">No city data available</p>
          )}
        </div>

        {/* Recent Visits Log (Spans 2 cols) */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 lg:col-span-2">
          <h3 className="font-heading text-md font-semibold text-slate-900 dark:text-white mb-4">
            Recent Visitor Log (Last 30 Clicks)
          </h3>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            {data.recentVisits.length > 0 ? (
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Date & Time</th>
                    <th className="px-4 py-2.5">IP Address</th>
                    <th className="px-4 py-2.5">Browser</th>
                    <th className="px-4 py-2.5">Device</th>
                    <th className="px-4 py-2.5">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {data.recentVisits.map((visit) => (
                    <tr key={visit._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(visit.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-500">
                        {visit.ipAddress}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {visit.browser}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {visit.device}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {visit.city}, {visit.country}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-500 py-10 text-center">No visitor records found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
