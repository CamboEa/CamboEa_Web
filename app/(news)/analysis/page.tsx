// Forex & Crypto News - Trading Signals & Analysis Page

import React from 'react';
import Link from 'next/link';
import { getActiveSignals } from '@/lib/api/signals';
import { SignalCard } from '@/components/features/analysis/AnalysisCard';

export const metadata = {
  title: 'Trading Signals: Gold & Bitcoin | Forex & Crypto News',
  description: 'Get specific entry, stop loss, and take profit levels for Gold (XAU/USD) and Bitcoin (BTC/USD) trading. Expert analysis with actionable trade setups.',
};

export default async function AnalysisPage() {
  const allSignals = await getActiveSignals();
  const btcSignals = allSignals.filter(s => s.asset === 'BTC/USD');
  const goldSignals = allSignals.filter(s => s.asset === 'XAU/USD');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-purple-900 via-purple-800 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium">Live Trading Signals</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Trading Signals & Analysis</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Get specific entry prices, stop loss levels, and take profit targets for Gold (XAU/USD) and Bitcoin (BTC/USD).
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{allSignals.length}</div>
              <div className="text-sm text-purple-100">Active Signals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">BTC</div>
              <div className="text-sm text-purple-100">{btcSignals.length} BTC Signals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">GOLD</div>
              <div className="text-sm text-purple-100">{goldSignals.length} Gold Signals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-300">
                {allSignals.length > 0 ? Math.round(allSignals.reduce((acc, s) => acc + s.confidence, 0) / allSignals.length) : 0}%
              </div>
              <div className="text-sm text-purple-100">Avg Confidence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Disclaimer */}
      <section className="bg-yellow-50 dark:bg-yellow-900/20 border-y border-yellow-200 dark:border-yellow-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Risk Warning:</strong> Trading involves substantial risk of loss. These signals are for educational purposes only and should not be considered as financial advice. Always use proper risk management and never trade with money you cannot afford to lose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bitcoin Signals Section */}
      <section id="btc-signals" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">BITCOIN</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bitcoin (BTC/USD) Trading Signals</h2>
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{btcSignals.length} active</span>
          </div>

          {btcSignals.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {btcSignals.map(signal => (
                <Link
                  key={signal.id}
                  href={`/analysis/${signal.id}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-xl"
                >
                  <SignalCard signal={signal} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">No active Bitcoin signals at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Gold Signals Section */}
      <section id="gold-signals" className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full">GOLD</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gold (XAU/USD) Trading Signals</h2>
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{goldSignals.length} active</span>
          </div>

          {goldSignals.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {goldSignals.map(signal => (
                <Link
                  key={signal.id}
                  href={`/analysis/${signal.id}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-xl"
                >
                  <SignalCard signal={signal} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">No active Gold signals at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">How to Use Our Signals</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Check Entry Price</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wait for price to reach the entry level before opening your position.</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-red-600 dark:text-red-400">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Set Stop Loss</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Always set your stop loss to manage risk. Never trade without protection.</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Target Take Profits</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Use multiple TP levels. Consider taking partial profits at each target.</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Manage Risk</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Risk only 1-2% of your account per trade. Consistency is key.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
