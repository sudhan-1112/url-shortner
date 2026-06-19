import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  GlobeAltIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const DomainsPage = () => {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/domains');
      if (res.data.success) {
        setDomains(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load domains.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain) {
      setError('Domain name cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await API.post('/domains', { domainName: newDomain });
      if (res.data.success) {
        setSuccess('Domain successfully registered!');
        setNewDomain('');
        fetchDomains();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register domain.');
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setActionLoadingId(id);
    setError('');
    setSuccess('');
    try {
      const res = await API.put(`/domains/${id}`);
      if (res.data.success) {
        setDomains((prev) =>
          prev.map((dom) => (dom._id === id ? { ...dom, isActive: res.data.data.isActive } : dom))
        );
        setSuccess(`Domain status updated!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update domain status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteDomain = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom domain? All shortened URLs linked to this domain will revert to the default domain.')) {
      return;
    }

    setActionLoadingId(id);
    setError('');
    setSuccess('');
    try {
      const res = await API.delete(`/domains/${id}`);
      if (res.data.success) {
        setSuccess('Domain deleted successfully.');
        fetchDomains();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete domain.');
      setActionLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GlobeAltIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            Custom Domains
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Register and manage custom domains to brand your shortened links
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3.5 text-sm text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-fadeIn">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3.5 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-fadeIn">
          <CheckCircleIcon className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Add new domain */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 h-fit">
          <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Add Custom Domain
          </h3>
          <form onSubmit={handleAddDomain} className="space-y-4">
            <div>
              <label htmlFor="domainName" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Domain Name
              </label>
              <input
                id="domainName"
                type="text"
                value={newDomain}
                onChange={(e) => {
                  setNewDomain(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                placeholder="links.mybrand.com"
                className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-900 placeholder-slate-450 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-805 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Configure your domain's DNS CNAME/A record to point to your URL Shortener deployment server.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              Add Domain
            </button>
          </form>
        </div>

        {/* Right column: Domains list */}
        <div className="md:col-span-2 glass rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800/80">
          <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
              Your Domains
            </h3>
          </div>

          <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
            {loading && domains.length === 0 ? (
              <div className="flex py-12 items-center justify-center">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : domains.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-550 text-slate-500 text-sm">
                No custom domains registered yet.
              </div>
            ) : (
              domains.map((dom) => (
                <div key={dom._id} className="flex items-center justify-between p-6 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900 text-indigo-650 text-indigo-400">
                      <GlobeAltIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {dom.domainName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Added {new Date(dom.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Active/Inactive Toggle Switch */}
                    <button
                      onClick={() => handleToggleStatus(dom._id)}
                      disabled={actionLoadingId !== null}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        dom.isActive ? 'bg-indigo-600' : 'bg-slate-250 bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          dom.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Delete Domain */}
                    <button
                      onClick={() => handleDeleteDomain(dom._id)}
                      disabled={actionLoadingId !== null}
                      className="rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-205 hover:border-rose-200 dark:hover:text-rose-450 transition"
                      title="Delete Domain"
                    >
                      <TrashIcon className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainsPage;
