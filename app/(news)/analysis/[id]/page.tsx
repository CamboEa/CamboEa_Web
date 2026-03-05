// Forex & Crypto News - Trading Signal Detail Page

import React from 'react';
import { notFound } from 'next/navigation';
import { getSignalById } from '@/lib/api/signals';
import { TradingSignal } from '@/types';
import { SignalDetailClient } from './signal-detail-client';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const signal = await getSignalById(id);
  if (!signal) {
    return {
      title: 'Signal Not Found | Forex & Crypto News',
      description: 'The requested trading signal could not be found.',
    };
  }

  return {
    title: `${signal.asset} Signal Detail | Forex & Crypto News`,
    description: `Entry, stop loss, take profit targets, and full analysis for ${signal.asset}.`,
  };
}

export default async function SignalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const signal = (await getSignalById(id)) as TradingSignal | null;
  if (!signal) notFound();

  return <SignalDetailClient signal={signal} />;
}

