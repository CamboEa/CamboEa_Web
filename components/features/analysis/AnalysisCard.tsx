// Forex & Crypto News - Trading Signal Card Component

import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { TradingSignal } from '@/types';

interface SignalCardProps {
  signal: TradingSignal;
  variant?: 'default' | 'compact';
}

export const SignalCard = ({ signal, variant = 'default' }: SignalCardProps) => {
  const isBuy = signal.direction === 'buy';
  
  const formatPrice = (price: number) => {
    // Format based on asset type
    if (signal.asset.includes('JPY')) {
      return price.toFixed(2);
    }
    if (signal.assetType === 'forex' && !signal.asset.includes('XAU')) {
      return price.toFixed(4);
    }
    if (price >= 1000) {
      return price.toLocaleString();
    }
    return price.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      hit_tp: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      hit_sl: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return styles[status] || styles.pending;
  };

  const calculatePips = (price1: number, price2: number) => {
    if (signal.asset.includes('JPY')) {
      return Math.abs(price1 - price2) * 100;
    }
    if (signal.assetType === 'forex') {
      return Math.abs(price1 - price2) * 10000;
    }
    return Math.abs(price1 - price2);
  };

  const slPips = calculatePips(signal.entryPrice, signal.stopLoss);
  const tp1Pips = calculatePips(signal.entryPrice, signal.takeProfit1);

  if (variant === 'compact') {
    return (
      <Card variant="bordered" className="hover:shadow-lg transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-bold ${isBuy ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {signal.direction.toUpperCase()}
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{signal.asset}</span>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(signal.status)}`}>
              {signal.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">Entry</div>
              <div className="font-semibold text-gray-900 dark:text-white">{formatPrice(signal.entryPrice)}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">SL</div>
              <div className="font-semibold text-red-600">{formatPrice(signal.stopLoss)}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">TP1</div>
              <div className="font-semibold text-green-600">{formatPrice(signal.takeProfit1)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bordered" className="hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 ${isBuy ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{signal.asset}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${isBuy ? 'bg-green-600' : 'bg-red-600'}`}>
              {signal.direction.toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Current Price</div>
            <div className="text-xl font-bold">{formatPrice(signal.currentPrice)}</div>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Entry Levels */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Entry Price */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-sm font-semibold">Entry Price</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(signal.entryPrice)}</div>
          </div>

          {/* Stop Loss */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-semibold">Stop Loss</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{formatPrice(signal.stopLoss)}</div>
            <div className="text-xs text-red-500 mt-1">
              {signal.assetType === 'forex' ? `${slPips.toFixed(1)} pips` : `$${slPips.toFixed(0)} risk`}
            </div>
          </div>
        </div>

        {/* Take Profit Levels */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Take Profit Targets
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">TP 1</div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">{formatPrice(signal.takeProfit1)}</div>
              <div className="text-xs text-green-500">
                {signal.assetType === 'forex' ? `+${tp1Pips.toFixed(1)} pips` : `+$${(signal.takeProfit1 - signal.entryPrice).toFixed(0)}`}
              </div>
            </div>
            {signal.takeProfit2 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">TP 2</div>
                <div className="text-lg font-bold text-green-700 dark:text-green-300">{formatPrice(signal.takeProfit2)}</div>
              </div>
            )}
            {signal.takeProfit3 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">TP 3</div>
                <div className="text-lg font-bold text-green-700 dark:text-green-300">{formatPrice(signal.takeProfit3)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Risk/Reward</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">1:{signal.riskRewardRatio.toFixed(1)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Confidence</div>
            <div className={`text-lg font-bold ${signal.confidence >= 70 ? 'text-green-600' : signal.confidence >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {signal.confidence}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
            <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(signal.status)}`}>
              {signal.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Analysis */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Analysis</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{signal.analysis}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {signal.author.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{signal.author.name}</div>
              {signal.author.role && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{signal.author.role}</div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">Published</div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(signal.publishedAt)}</div>
          </div>
        </div>

        {/* Expiry Warning */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Signal expires: {formatDate(signal.expiresAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
