import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

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

const PublicStatsPage = () => {
  const { shortCode } = useParams();
  const { theme } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get(`/analytics/${shortCode}`, {
          params: { public: 'true' }
        });
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch public analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [shortCode]);

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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-600 dark:text-rose-400">
          <h2 className="font-heading text-xl font-bold mb-2">Public Stats Unavailable</h2>
          <p className="text-sm">{error}</p>
        </div>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Chart configs
  const trendLabels = data.dailyTrend.map(item => item.date);
  const trendCounts = data.dailyTrend.map(item => item.count);

  const trendChartData = {
    labels: trendLabels.length > 0 ? trendLabels : ['No recent visits'],
    datasets: [
      {
        fill: true,
        label: 'Clicks',
        data: trendCounts.length > 0 ? trendCounts : [0],
        borderColor: '#10b981', // Emerald 500
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  const trendChartOptions = {
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

  const deviceLabels = data.deviceStats.map(item => item.name);
  const deviceCounts = data.deviceStats.map(item => item.count);

  const deviceChartData = {
    labels: deviceLabels.length > 0 ? deviceLabels : ['No data'],
    datasets: [
      {
        data: deviceCounts.length > 0 ? deviceCounts : [1],
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f172a' : '#ffffff'
      }
    ]
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-700/10 dark:bg-emerald-900/30 dark:text-emerald-400">
              <GlobeAltIcon className="h-3.5 w-3.5" />
              Public Statistics
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white truncate">
            /{shortCode}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
            Destination: <span className="text-slate-700 dark:text-slate-200 font-medium">{data.url.originalUrl}</span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-0.5">
            Short URL: <a href={`http://localhost:5000/${shortCode}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-650 text-indigo-600 dark:text-indigo-400 font-medium">http://localhost:5000/{shortCode}</a>
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          {copied ? (
            <>
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-emerald-600" />
              Copied Link
            </>
          ) : (
            <>
              <ClipboardIcon className="h-5 w-5" />
              Copy Short Link
            </>
          )}
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <div className="glass rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Visits</p>
          <p className="font-heading text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {data.summary.totalClicks}
          </p>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-semibold text-slate-700 dark:text-slate-350">
            Last Visited
          </p>
          <p className="font-heading text-lg font-bold text-slate-900 dark:text-white mt-3.5">
            {data.summary.lastVisit ? new Date(data.summary.lastVisit).toLocaleString() : 'Never'}
          </p>
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 lg:col-span-2">
          <h3 className="font-heading text-md font-semibold text-slate-900 dark:text-white mb-4">
            Visitor Trends (30 Days)
          </h3>
          <div className="h-72">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <h3 className="font-heading text-md font-semibold text-slate-900 dark:text-white mb-4">
            Device Share
          </h3>
          <div className="h-72 flex items-center justify-center">
            {data.deviceStats.length > 0 ? (
              <Doughnut data={deviceChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <p className="text-sm text-slate-500">No device records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicStatsPage;
