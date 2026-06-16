import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  ChartBarIcon,
  QrCodeIcon,
  BoltIcon,
  ShieldCheckIcon,
  DocumentArrowUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      name: 'Advanced Analytics',
      description: 'Track clicks, user device, browser, and geographic location in real-time.',
      icon: ChartBarIcon,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
    },
    {
      name: 'QR Code Generation',
      description: 'Generate high-quality QR codes instantly for every link you shorten.',
      icon: QrCodeIcon,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    },
    {
      name: 'Custom Branding',
      description: 'Personalize your links with custom aliases to increase trust and clicks.',
      icon: BoltIcon,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    },
    {
      name: 'Secure and Encrypted',
      description: 'All links and operations are protected by standard security protocols.',
      icon: ShieldCheckIcon,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    },
    {
      name: 'CSV Bulk Upload',
      description: 'Shorten hundreds of destination links in seconds using a single CSV upload.',
      icon: DocumentArrowUpIcon,
      color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
    },
    {
      name: 'Link Expiration',
      description: 'Define exact dates when your links expire to control click lifespans.',
      icon: ClockIcon,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    }
  ];

  return (
    <div className="relative isolate overflow-hidden min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Background Gradients */}
      <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-slate-50 shadow-xl shadow-indigo-600/10 ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-900/50" />
      
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:px-8">
        {/* Hero Section */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
          >
            🚀 Say hello to URL Shortener Pro v1.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl"
          >
            Shorten Your Links, <span className="text-gradient">Track Your Reach</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400"
          >
            Create short, powerful, and secure links with analytics, custom aliases, QR codes, link expiration, and batch CSV imports.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 focus:outline-none transition-all duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 focus:outline-none transition-all duration-200"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="text-base font-semibold leading-6 text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Sign In <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Dashboard Preview / Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-20 max-w-5xl rounded-2xl border border-slate-200/50 bg-white/40 p-4 shadow-2xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/40"
        >
          <div className="relative overflow-hidden rounded-xl bg-slate-900 shadow-2xl aspect-[16/10] flex flex-col">
            {/* Mock Header */}
            <div className="flex h-10 w-full items-center gap-2 border-b border-slate-800 bg-slate-950/80 px-4">
              <div className="h-3.5 w-3.5 rounded-full bg-rose-500"></div>
              <div className="h-3.5 w-3.5 rounded-full bg-amber-500"></div>
              <div className="h-3.5 w-3.5 rounded-full bg-emerald-500"></div>
              <div className="ml-4 h-5 w-40 rounded bg-slate-800"></div>
            </div>
            {/* Mock Dashboard Body */}
            <div className="flex-1 p-6 flex flex-col gap-6 text-left">
              <div className="flex gap-4">
                <div className="h-20 w-1/3 rounded-xl bg-slate-800 border border-slate-700/50 p-3">
                  <div className="h-3 w-12 bg-slate-600 rounded mb-2"></div>
                  <div className="h-6 w-24 bg-indigo-500 rounded"></div>
                </div>
                <div className="h-20 w-1/3 rounded-xl bg-slate-800 border border-slate-700/50 p-3">
                  <div className="h-3 w-16 bg-slate-600 rounded mb-2"></div>
                  <div className="h-6 w-16 bg-emerald-500 rounded"></div>
                </div>
                <div className="h-20 w-1/3 rounded-xl bg-slate-800 border border-slate-700/50 p-3">
                  <div className="h-3 w-10 bg-slate-600 rounded mb-2"></div>
                  <div className="h-6 w-20 bg-amber-500 rounded"></div>
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-slate-800/50 border border-slate-700/30 p-4 flex flex-col gap-3">
                <div className="flex justify-between border-b border-slate-700/40 pb-2">
                  <div className="h-3.5 w-40 bg-slate-600 rounded"></div>
                  <div className="h-3.5 w-16 bg-slate-600 rounded"></div>
                </div>
                <div className="flex justify-between border-b border-slate-700/20 pb-2">
                  <div className="h-3 w-56 bg-slate-700 rounded"></div>
                  <div className="h-3 w-8 bg-slate-700 rounded"></div>
                </div>
                <div className="flex justify-between border-b border-slate-700/20 pb-2">
                  <div className="h-3 w-44 bg-slate-700 rounded"></div>
                  <div className="h-3 w-12 bg-slate-700 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 w-48 bg-slate-700 rounded"></div>
                  <div className="h-3 w-10 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mx-auto mt-32 max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Everything you need to manage links
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
              A comprehensive toolset designed for tracking, custom integrations, and simple workflows.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800/50 dark:bg-slate-900"
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.color}`}>
                      <feature.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
