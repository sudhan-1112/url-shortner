import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const CreateUrlModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customAlias: '',
    expiryDate: ''
  });
  
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDomains();
    }
  }, [isOpen]);

  const fetchDomains = async () => {
    try {
      const res = await API.get('/domains');
      if (res.data.success) {
        setDomains(res.data.data.filter(d => d.isActive));
      }
    } catch (err) {
      console.error('Failed to fetch active domains', err);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.originalUrl) {
      setError('Destination URL is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/urls', {
        ...formData,
        domain: selectedDomain
      });
      if (res.data.success) {
        onSuccess(res.data.data);
        setFormData({ originalUrl: '', customAlias: '', expiryDate: '' });
        setSelectedDomain('');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white">
            Shorten a New URL
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3.5 text-sm text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="originalUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Destination URL <span className="text-rose-500">*</span>
            </label>
            <input
              id="originalUrl"
              name="originalUrl"
              type="url"
              required
              value={formData.originalUrl}
              onChange={handleChange}
              className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 text-sm"
              placeholder="https://example.com/very/long/destination/url"
            />
          </div>

          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Short Link Domain
            </label>
            <select
              id="domain"
              name="domain"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white text-sm"
            >
              <option value="">Default Domain (ShortyPro default)</option>
              {domains.map((dom) => (
                <option key={dom._id} value={dom.domainName}>
                  {dom.domainName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="customAlias" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Custom Alias <span className="text-xs text-slate-500">(Optional)</span>
            </label>
            <div className="flex rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950">
              <span className="inline-flex items-center px-3 border-r border-slate-200 dark:border-slate-800 text-slate-500 text-sm select-none">
                {selectedDomain ? `${selectedDomain}/` : 'shorty.com/'}
              </span>
              <input
                id="customAlias"
                name="customAlias"
                type="text"
                value={formData.customAlias}
                onChange={handleChange}
                className="block w-full border-0 bg-transparent py-2.5 px-3 text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white text-sm"
                placeholder="myportfolio"
              />
            </div>
          </div>

          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Expiration Date <span className="text-xs text-slate-500">(Optional)</span>
            </label>
            <input
              id="expiryDate"
              name="expiryDate"
              type="datetime-local"
              value={formData.expiryDate}
              onChange={handleChange}
              className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 text-sm"
            />
          </div>

          <div className="flex gap-3 justify-end border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-700 disabled:bg-indigo-600/50"
            >
              {loading ? 'Shortening...' : 'Shorten Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUrlModal;
