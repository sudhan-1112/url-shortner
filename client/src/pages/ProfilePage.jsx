import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass rounded-2xl p-8 shadow-xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="flex flex-col items-center text-center pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="h-24 w-24 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-200 dark:border-indigo-850 mb-4 text-indigo-600 dark:text-indigo-400">
            <UserCircleIcon className="h-20 w-20" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            {user?.name || 'User Profile'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered Account
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-650 text-slate-400">
              <EnvelopeIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email Address</p>
              <p className="text-md font-medium text-slate-900 dark:text-white mt-0.5">{user?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-650 text-slate-400">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Member Since</p>
              <p className="text-md font-medium text-slate-900 dark:text-white mt-0.5">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
