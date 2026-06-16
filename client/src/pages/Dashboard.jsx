import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import CreateUrlModal from '../components/CreateUrlModal';
import CsvUploadModal from '../components/CsvUploadModal';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon,
  ChartBarIcon,
  QrCodeIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  
  // URL Actions State
  const [activeQrCode, setActiveQrCode] = useState(null);
  const [editingUrl, setEditingUrl] = useState(null);
  const [deletingUrl, setDeletingUrl] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Edit Destination URL state
  const [editForm, setEditForm] = useState({ originalUrl: '', expiryDate: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchUrls();
  }, [pagination.page, sortBy, sortOrder]);

  const fetchUrls = async (searchQuery = search) => {
    setLoading(true);
    try {
      const res = await API.get('/urls', {
        params: {
          search: searchQuery,
          sortBy,
          sortOrder,
          page: pagination.page,
          limit: pagination.limit
        }
      });
      if (res.data.success) {
        setUrls(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch URLs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchUrls(search);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPagination({ ...pagination, page: 1 });
  };

  const handleCopy = (id, shortCode) => {
    const baseUrl = window.location.origin.includes('localhost')
      ? 'http://localhost:5000'
      : window.location.origin;
    const shortLink = `${baseUrl}/${shortCode}`;
    
    navigator.clipboard.writeText(shortLink);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deletingUrl) return;
    try {
      const res = await API.delete(`/urls/${deletingUrl._id}`);
      if (res.data.success) {
        setDeletingUrl(null);
        fetchUrls();
      }
    } catch (err) {
      console.error('Failed to delete URL', err);
    }
  };

  const startEdit = (url) => {
    setEditingUrl(url);
    setEditForm({
      originalUrl: url.originalUrl,
      expiryDate: url.expiryDate ? new Date(url.expiryDate).toISOString().slice(0, 16) : ''
    });
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.originalUrl) {
      setEditError('Destination URL is required');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      const res = await API.put(`/urls/${editingUrl._id}`, {
        originalUrl: editForm.originalUrl,
        expiryDate: editForm.expiryDate || null
      });
      if (res.data.success) {
        setEditingUrl(null);
        fetchUrls();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update URL');
    } finally {
      setEditLoading(false);
    }
  };

  const totalClicksCurrentPage = urls.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">
            Links Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create, manage, and analyze your shortened URLs
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCsvOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 transition"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            Bulk CSV Upload
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-700 transition"
          >
            <PlusIcon className="h-4 w-4" />
            Create URL
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="glass rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Active Links</p>
          <p className="font-heading text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {pagination.total}
          </p>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Clicks (This Page)</p>
          <p className="font-heading text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {totalClicksCurrentPage}
          </p>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 font-semibold text-indigo-600 dark:text-indigo-400">
            CSV Templates
          </p>
          <a
            href="data:text/csv;charset=utf-8,originalUrl,customAlias,expiryDate%0Ahttps://google.com,google-search,2026-12-31%0Ahttps://github.com,,2026-10-01"
            download="bulk_urls_template.csv"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 mt-3"
          >
            Download CSV Format
          </a>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search original URL or alias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 text-sm"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
        </form>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-400">Sort by:</span>
          <button
            onClick={() => handleSort('createdAt')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold border ${
              sortBy === 'createdAt'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400'
                : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400'
            }`}
          >
            Date {sortBy === 'createdAt' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
          </button>
          <button
            onClick={() => handleSort('clickCount')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold border ${
              sortBy === 'clickCount'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400'
                : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400'
            }`}
          >
            Clicks {sortBy === 'clickCount' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
          </button>
        </div>
      </div>

      {/* URLs Table */}
      <div className="glass rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800/80">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex py-20 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
            </div>
          ) : urls.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-slate-600 dark:text-slate-400">No URLs found.</p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Create your first link
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Original Destination</th>
                  <th className="px-6 py-4 font-semibold">Short URL</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold text-center">Clicks</th>
                  <th className="px-6 py-4 font-semibold">Expires</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 text-slate-800 dark:text-slate-300">
                {urls.map((url) => {
                  const displayShortCode = url.shortCode;
                  const redirectUrl = `http://localhost:5000/${displayShortCode}`;
                  
                  return (
                    <tr key={url._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                      {/* Original URL */}
                      <td className="px-6 py-4 max-w-xs truncate">
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 group"
                        >
                          {url.originalUrl}
                          <ArrowTopRightOnSquareIcon className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                        </a>
                      </td>
                      
                      {/* Short URL */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <a
                            href={redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 group"
                          >
                            {displayShortCode}
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                          </a>
                          <button
                            onClick={() => handleCopy(url._id, displayShortCode)}
                            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
                            title="Copy link"
                          >
                            {copiedId === url._id ? (
                              <ClipboardDocumentCheckIcon className="h-4.5 w-4.5 text-emerald-600" />
                            ) : (
                              <ClipboardIcon className="h-4.5 w-4.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </td>

                      {/* Click Count */}
                      <td className="px-6 py-4 text-center whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {url.clickCount || 0}
                      </td>

                      {/* Expiry Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {url.expiryDate ? (
                          <div className={`flex items-center gap-1 ${new Date(url.expiryDate) < new Date() ? 'text-rose-500 font-semibold' : ''}`}>
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(url.expiryDate).toLocaleDateString()}
                          </div>
                        ) : (
                          'Never'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveQrCode(url.qrCode)}
                            className="rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 dark:hover:text-indigo-400 transition"
                            title="QR Code"
                          >
                            <QrCodeIcon className="h-4.5 w-4.5" />
                          </button>
                          <Link
                            to={`/analytics/${displayShortCode}`}
                            className="rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 dark:hover:text-indigo-400 transition"
                            title="View Stats"
                          >
                            <ChartBarIcon className="h-4.5 w-4.5" />
                          </Link>
                          <button
                            onClick={() => startEdit(url)}
                            className="rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 dark:hover:text-indigo-400 transition"
                            title="Edit Link"
                          >
                            <PencilSquareIcon className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => setDeletingUrl(url)}
                            className="rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 hover:border-rose-200 dark:hover:text-rose-450 transition"
                            title="Delete"
                          >
                            <TrashIcon className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && urls.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-6 py-4">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} links total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateUrlModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchUrls()}
      />
      <CsvUploadModal
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
        onSuccess={() => fetchUrls()}
      />

      {/* QR Code Viewer Overlay */}
      {activeQrCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Link QR Code
            </h3>
            <div className="flex justify-center border border-slate-100 dark:border-slate-850 p-4 rounded-xl bg-white mb-4">
              <img src={activeQrCode} alt="QR Code" className="h-48 w-48 object-contain" />
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Right-click the image above and select "Save image as..." to download it.
            </p>
            <button
              onClick={() => setActiveQrCode(null)}
              className="w-full rounded-xl bg-indigo-650 bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Edit Overlay Modal */}
      {editingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-850 pb-3 mb-4">
              Edit Link Details
            </h3>

            {editError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600 border border-rose-500/20 mb-4">
                <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Short Code / Alias
                </label>
                <input
                  type="text"
                  disabled
                  value={editingUrl.shortCode}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3 text-slate-500 cursor-not-allowed dark:border-slate-800 dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={editForm.originalUrl}
                  onChange={(e) => setEditForm({ ...editForm, originalUrl: e.target.value })}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Expiration Date
                </label>
                <input
                  type="datetime-local"
                  value={editForm.expiryDate}
                  onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-850 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUrl(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {deletingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4 dark:bg-rose-950/50">
              <TrashIcon className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Delete Shortened Link?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">/{deletingUrl.shortCode}</span>? This will permanently delete the shortened URL and all of its associated click tracking history. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-stretch">
              <button
                onClick={() => setDeletingUrl(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                No, Keep It
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
