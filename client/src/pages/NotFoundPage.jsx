import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ExclamationCircleIcon, HomeIcon, LinkIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  const location = useLocation();
  const isExpired = location.pathname.includes('/expired');

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <div className="glass rounded-2xl p-10 max-w-lg shadow-xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 text-indigo-500 mb-6 shadow-md">
          {isExpired ? (
            <ExclamationCircleIcon className="h-10 w-10 text-rose-500" />
          ) : (
            <LinkIcon className="h-10 w-10" />
          )}
        </div>
        
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {isExpired ? 'Link Expired' : 'Page Not Found'}
        </h1>
        
        <p className="mt-4 text-md text-slate-650 text-slate-600 dark:text-slate-400">
          {isExpired 
            ? 'This shortened link has passed its designated expiration date and is no longer active.' 
            : 'The link you are trying to visit does not exist or may have been deleted.'
          }
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition"
          >
            <HomeIcon className="h-4.5 w-4.5" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
