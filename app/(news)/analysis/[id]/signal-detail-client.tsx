'use client';

// Forex & Crypto News - Trading Signal Detail (Dashboard UI)

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { TradingSignal } from '@/types';

type ScenarioKey = 'primary' | 'alternative';

type ScenarioData = {
  label: string;
  direction: 'buy' | 'sell';
  entry: number;
  sl: number;
  tp1: number;
  tp2?: number;
  tp3?: number;
};

function formatPrice(signal: TradingSignal, price: number) {
  if (signal.asset.includes('JPY')) return price.toFixed(2);
  if (signal.assetType === 'forex' && !signal.asset.includes('XAU')) return price.toFixed(4);
  if (price >= 1000) return price.toLocaleString();
  return price.toFixed(2);
}

function formatDateTime(dateString: string, timeZone?: string) {
  const d = new Date(dateString);
  return d.toLocaleString('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getContractMultiplier(signal: TradingSignal) {
  // Mirrors the simple assumptions from your `testing.html` calculator.
  // - XAU/USD: $1 move on 1.0 lot ~= $100 (100 oz)
  // - BTC/USD: treat lot size as BTC amount (1.0 lot = 1 BTC)
  if (signal.asset.includes('XAU')) return 100;
  if (signal.asset.includes('BTC')) return 1;
  return 1;
}

function buildAlternativeScenario(primary: ScenarioData): ScenarioData {
  const risk = Math.abs(primary.entry - primary.sl);
  const reward = Math.abs((primary.tp2 ?? primary.tp1) - primary.entry);
  const altDirection: 'buy' | 'sell' = primary.direction === 'buy' ? 'sell' : 'buy';

  // Keep entry the same; mirror SL/TP distances for a "hedge" view.
  const altSl = altDirection === 'buy' ? primary.entry - risk : primary.entry + risk;
  const altTp1 = altDirection === 'buy' ? primary.entry + reward : primary.entry - reward;
  const altTp2 = altDirection === 'buy' ? primary.entry + reward * 1.6 : primary.entry - reward * 1.6;
  const altTp3 = altDirection === 'buy' ? primary.entry + reward * 2.4 : primary.entry - reward * 2.4;

  return {
    label: 'Alternative (Hedge)',
    direction: altDirection,
    entry: primary.entry,
    sl: altSl,
    tp1: altTp1,
    tp2: altTp2,
    tp3: altTp3,
  };
}

function seriesBetween(start: number, end: number, points: number) {
  if (points <= 1) return [end];
  const out: number[] = [];
  const step = (end - start) / (points - 1);
  for (let i = 0; i < points; i++) {
    const base = start + step * i;
    const wiggle = i === 0 || i === points - 1 ? 0 : (Math.sin(i * 0.9) * step * 0.25);
    out.push(base + wiggle);
  }
  return out;
}

function CanvasProjectionChart(props: {
  title: string;
  subtitle: string;
  accent: 'gold' | 'red';
  entry: number;
  sl: number;
  series: number[];
  labels: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const w = Math.max(320, parent.clientWidth);
    const h = 320;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padding = { left: 44, right: 18, top: 18, bottom: 34 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    const minY = Math.min(...props.series, props.entry, props.sl);
    const maxY = Math.max(...props.series, props.entry, props.sl);
    const padY = (maxY - minY) * 0.12 || 1;
    const y0 = minY - padY;
    const y1 = maxY + padY;

    const xFor = (i: number) => padding.left + (plotW * i) / Math.max(1, props.series.length - 1);
    const yFor = (v: number) => padding.top + (plotH * (y1 - v)) / (y1 - y0);

    // Background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(148,163,184,0.25)'; // slate-400
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const yy = padding.top + (plotH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding.left, yy);
      ctx.lineTo(w - padding.right, yy);
      ctx.stroke();
    }

    // Entry & SL lines
    const drawHLine = (value: number, color: string, dash: number[]) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.setLineDash(dash);
      ctx.lineWidth = 1.5;
      const yy = yFor(value);
      ctx.beginPath();
      ctx.moveTo(padding.left, yy);
      ctx.lineTo(w - padding.right, yy);
      ctx.stroke();
      ctx.restore();
    };

    drawHLine(props.entry, 'rgba(59,130,246,0.9)', [6, 5]); // blue
    drawHLine(props.sl, 'rgba(239,68,68,0.9)', [2, 3]); // red

    // Projection line
    const grad = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    if (props.accent === 'gold') {
      grad.addColorStop(0, 'rgba(212,175,55,0.32)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = 'rgba(184,150,40,1)';
    } else {
      grad.addColorStop(0, 'rgba(239,68,68,0.25)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = 'rgba(239,68,68,1)';
    }

    // Fill
    ctx.beginPath();
    props.series.forEach((v, i) => {
      const x = xFor(i);
      const y = yFor(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(xFor(props.series.length - 1), yFor(y0));
    ctx.lineTo(xFor(0), yFor(y0));
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke line (again)
    ctx.beginPath();
    props.series.forEach((v, i) => {
      const x = xFor(i);
      const y = yFor(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.stroke();

    // Points
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = props.accent === 'gold' ? 'rgba(184,150,40,1)' : 'rgba(239,68,68,1)';
    props.series.forEach((v, i) => {
      if (i % 2 !== 0 && i !== props.series.length - 1) return;
      const x = xFor(i);
      const y = yFor(v);
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // X labels (sparse)
    ctx.fillStyle = 'rgba(71,85,105,0.95)'; // slate-600
    ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    const step = Math.max(1, Math.floor(props.labels.length / 6));
    for (let i = 0; i < props.labels.length; i += step) {
      const x = xFor(i);
      const txt = props.labels[i];
      ctx.fillText(txt, x - 14, h - 12);
    }
  }, [props.accent, props.entry, props.labels, props.series, props.sl]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{props.title}</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400">{props.subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Analysis timeframe</div>
          <div className="text-sm font-semibold text-slate-800 dark:text-white">24 Hours</div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden bg-slate-50 dark:bg-gray-950 border border-slate-100 dark:border-gray-800">
        <div className="w-full h-[320px] flex items-center justify-center">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <p className="text-xs text-center text-slate-400 dark:text-gray-500 mt-3 italic">
        Times shown in Phnom Penh (GMT+7)
      </p>
    </div>
  );
}

export function SignalDetailClient({ signal }: { signal: TradingSignal }) {
  const [scenario, setScenario] = useState<ScenarioKey>('primary');
  const [ppClock, setPpClock] = useState<string>('Loading...');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const txt = now.toLocaleString('en-US', {
        timeZone: 'Asia/Phnom_Penh',
        weekday: 'short',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setPpClock(txt);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const primaryScenario: ScenarioData = useMemo(
    () => ({
      label: 'Primary Strategy',
      direction: signal.direction,
      entry: signal.entryPrice,
      sl: signal.stopLoss,
      tp1: signal.takeProfit1,
      tp2: signal.takeProfit2,
      tp3: signal.takeProfit3,
    }),
    [signal]
  );

  const altScenario = useMemo(() => buildAlternativeScenario(primaryScenario), [primaryScenario]);
  const currentScenario = scenario === 'primary' ? primaryScenario : altScenario;

  const rr = useMemo(() => {
    const risk = Math.abs(currentScenario.entry - currentScenario.sl);
    const reward = Math.abs((currentScenario.tp2 ?? currentScenario.tp1) - currentScenario.entry);
    const v = reward / (risk || 1);
    return Number.isFinite(v) ? v : 0;
  }, [currentScenario.entry, currentScenario.sl, currentScenario.tp1, currentScenario.tp2]);

  const chart = useMemo(() => {
    const points = 13;
    const target = currentScenario.tp2 ?? currentScenario.tp1;
    const start = signal.currentPrice;
    const series = seriesBetween(start, target, points);
    const labels = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00', '02:00', '04:00', '06:00'];
    const accent: 'gold' | 'red' = currentScenario.direction === 'buy' ? 'gold' : 'red';
    return { series, labels, accent };
  }, [currentScenario.direction, currentScenario.tp1, currentScenario.tp2, signal.currentPrice]);

  const lotOptions = [
    { label: '0.01', value: 0.01 },
    { label: '0.10', value: 0.1 },
    { label: '1.00', value: 1.0 },
  ];
  const [lotSize, setLotSize] = useState<number>(0.1);

  const calc = useMemo(() => {
    const multiplier = getContractMultiplier(signal);
    const tp = currentScenario.tp2 ?? currentScenario.tp1;
    const priceDiffProfit = Math.abs(tp - currentScenario.entry);
    const priceDiffLoss = Math.abs(currentScenario.entry - currentScenario.sl);
    const profitValue = priceDiffProfit * multiplier * lotSize;
    const lossValue = priceDiffLoss * multiplier * lotSize;
    return { profitValue, lossValue, multiplier };
  }, [currentScenario.entry, currentScenario.sl, currentScenario.tp1, currentScenario.tp2, lotSize, signal]);

  const isPrimaryBuy = primaryScenario.direction === 'buy';
  const headerBadge = isPrimaryBuy ? 'BUY' : 'SELL';
  const headerAccent = isPrimaryBuy ? 'border-yellow-500' : 'border-red-500';

  const symbolBadge = signal.asset.includes('XAU') ? 'Au' : signal.asset.includes('BTC') ? 'BTC' : signal.asset.slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white">
      <header className={`bg-slate-900 text-white sticky top-0 z-50 shadow-lg border-b ${headerAccent}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center text-slate-900 font-extrabold tracking-wide shrink-0">
              {symbolBadge}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight truncate">{signal.asset} Signal Detail</h1>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isPrimaryBuy ? 'bg-green-600' : 'bg-red-600'}`}>
                  {headerBadge}
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                Published: {formatDateTime(signal.publishedAt, 'Asia/Phnom_Penh')} (PP Time)
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs text-yellow-300 font-semibold uppercase tracking-wider">Current time (Phnom Penh)</div>
            <div className="text-sm font-mono font-bold">{ppClock}</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link href="/analysis" className="text-sm font-semibold text-slate-700 dark:text-gray-200 hover:underline">
            Back to signals
          </Link>
          <div className="text-sm text-slate-600 dark:text-gray-300">
            Expires: <span className="font-semibold">{formatDateTime(signal.expiresAt, 'Asia/Phnom_Penh')}</span>
          </div>
        </div>

        {/* Executive summary */}
        <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-yellow-500 border border-slate-100 dark:border-gray-800 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Market Executive Summary</h2>
          <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
            This page shows the full trading plan for <span className="font-semibold">{signal.asset}</span> including entry, stop loss, take profit targets,
            and a quick profit/risk calculator. Use the scenario toggle to compare the primary setup vs a hedge view.
          </p>
        </section>

        {/* Scenario toggle */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setScenario('primary')}
            className={`px-6 py-2 rounded-full font-bold border-2 transition-colors shadow-sm ${
              scenario === 'primary'
                ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                : 'bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-800 hover:border-slate-900 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Primary Strategy
          </button>
          <button
            type="button"
            onClick={() => setScenario('alternative')}
            className={`px-6 py-2 rounded-full font-bold border-2 transition-colors shadow-sm ${
              scenario === 'alternative'
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                : 'bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-800 hover:border-red-600 hover:text-red-600'
            }`}
          >
            Alternative (Hedge)
          </button>
        </div>

        {/* KPI / Signal cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Entry */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-8 -mt-8" />
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-widest">Entry Zone</span>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{formatPrice(signal, currentScenario.entry)}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Wait for confirmation candle close</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-800">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                Plan order
              </span>
            </div>
          </div>

          {/* TP Targets */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-bl-full -mr-8 -mt-8" />
            <div>
              <span className="text-xs font-bold text-green-600 dark:text-green-300 uppercase tracking-widest">Take Profit Targets</span>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-gray-400">TP1 (Safe):</span>
                  <span className="font-bold text-slate-800 dark:text-white">{formatPrice(signal, currentScenario.tp1)}</span>
                </div>
                {currentScenario.tp2 != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-gray-400">TP2 (Main):</span>
                    <span className="font-bold text-slate-800 dark:text-white">{formatPrice(signal, currentScenario.tp2)}</span>
                  </div>
                )}
                {currentScenario.tp3 != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-gray-400">TP3 (Swing):</span>
                    <span className="font-bold text-slate-800 dark:text-white">{formatPrice(signal, currentScenario.tp3)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stop Loss */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-bl-full -mr-8 -mt-8" />
            <div>
              <span className="text-xs font-bold text-red-600 dark:text-red-300 uppercase tracking-widest">Stop Loss</span>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{formatPrice(signal, currentScenario.sl)}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Invalidation level</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-800">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                Risk control
              </span>
            </div>
          </div>

          {/* R:R */}
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -mr-8 -mt-8" />
            <div>
              <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">Risk / Reward</span>
              <h3 className="text-3xl font-bold mt-2">1 : {rr.toFixed(1)}</h3>
              <p className="text-sm text-slate-300 mt-1">Based on main target</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${signal.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
              <span className="text-xs text-slate-300">Status: {signal.status.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
        </section>

        {/* Chart + timeline */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <CanvasProjectionChart
              title="Intraday Price Projection"
              subtitle="Simple projected path to the main target (visual guide)"
              accent={chart.accent}
              entry={currentScenario.entry}
              sl={currentScenario.sl}
              series={chart.series}
              labels={chart.labels}
            />
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Session Timeline (PP Time)</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Key session windows to watch for volatility.</p>

            <div className="flex-grow space-y-4 overflow-y-auto pr-2 max-h-[360px]">
              {[
                { t: '06:00 AM', c: 'bg-slate-300', title: 'Asian session', desc: 'Typically lower volatility; good for planning entries.' },
                { t: '02:00 PM', c: 'bg-yellow-500', title: 'London open', desc: 'Volume injection; watch range breaks and liquidity grabs.' },
                { t: '07:30 PM', c: 'bg-blue-500', title: 'New York open', desc: 'Momentum continuation or reversal; manage exposure.' },
                { t: '11:00 PM', c: 'bg-slate-300', title: 'Daily close approach', desc: 'Profit taking and position adjustments.' },
              ].map((e) => (
                <div className="flex gap-4" key={e.t}>
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 ${e.c} rounded-full mt-2`} />
                    <div className="w-0.5 h-full bg-slate-100 dark:bg-gray-800 my-1" />
                  </div>
                  <div className="pb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400">{e.t}</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{e.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-gray-400">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Analysis + calculator */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border-t-4 border-blue-500 border border-slate-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Technical Analysis</h3>
            <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed mb-4">
              {signal.analysis}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-200 uppercase">Key observation</span>
              <p className="text-sm text-blue-900 dark:text-blue-100 mt-1">
                If price violates the stop loss level, the setup is invalidated. Consider reducing risk or waiting for a new signal.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border-t-4 border-green-500 border border-slate-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Profit & Risk Calculator</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase mb-1">Lot size</label>
                <select
                  value={String(lotSize)}
                  onChange={(e) => setLotSize(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                >
                  {lotOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                  Multiplier: {calc.multiplier} (simple estimate)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-xs text-green-700 dark:text-green-300">Potential profit (main target)</span>
                  <div className="text-lg font-bold text-green-800 dark:text-green-200">
                    ${calc.profitValue.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-xs text-red-700 dark:text-red-300">Potential loss (stop loss)</span>
                  <div className="text-lg font-bold text-red-800 dark:text-red-200">
                    ${calc.lossValue.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-950 rounded-lg border border-slate-200 dark:border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-400">Current price:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(signal, signal.currentPrice)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-600 dark:text-gray-400">Entry:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(signal, currentScenario.entry)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-600 dark:text-gray-400">Stop loss:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(signal, currentScenario.sl)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center text-xs text-slate-400 dark:text-gray-500 py-8 border-t border-slate-200 dark:border-gray-800">
          <p className="mb-2">
            Disclaimer: Trading involves high risk. This analysis is for educational purposes only.
          </p>
          <p>
            Signal author: <span className="font-semibold">{signal.author.name}</span>
            {signal.author.role ? ` (${signal.author.role})` : ''}.
          </p>
        </footer>
      </div>
    </main>
  );
}

