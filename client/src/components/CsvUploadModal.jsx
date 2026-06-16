import React, { useState, useRef } from 'react';
import API from '../services/api';
import { XMarkIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const CsvUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const fileInputRef = useRef();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please select a valid CSV file (.csv)');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setSummary(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
        setError('Please drop a valid CSV file (.csv)');
        return;
      }
      setFile(droppedFile);
      setError('');
      setSummary(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/urls/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setSummary(res.data.summary);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onSuccess(); // Triggers reload of list in parent dashboard
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    setSummary(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white">
            Bulk Upload URLs via CSV
          </h3>
          <button onClick={handleClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3.5 text-sm text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {summary && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 text-sm">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
              <CheckCircleIcon className="h-5 w-5" />
              <span>Bulk upload completed successfully!</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• Total rows processed: <span className="font-bold text-slate-900 dark:text-white">{summary.totalProcessed}</span></li>
              <li>• Successfully shortened: <span className="font-bold text-emerald-600 dark:text-emerald-400">{summary.successCount}</span></li>
              <li>• Skipped (due to invalid URL or duplicate alias): <span className="font-bold text-rose-605 text-rose-500">{summary.skippedCount}</span></li>
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-55 bg-slate-50/50 dark:bg-slate-950/20 py-10 px-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <DocumentArrowUpIcon className="h-10 w-10 text-slate-400 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {file ? file.name : 'Drag and drop your CSV file here, or click to browse'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              CSV file must contain an <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-350">originalUrl</code> header column.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
          </div>

          <div className="flex gap-3 justify-end border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-80"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-700 disabled:bg-indigo-600/50"
            >
              {loading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CsvUploadModal;
