'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const KRAKEN_WS = 'wss://ws.kraken.com';
/** Kraken Tether Gold vs USD — same instrument CamboEA uses for “XAU/USD” in `/api/m`. */
const KRAKEN_PAIR = 'XAUT/USD';

const HEAT_COLS = 100;
const HEAT_ROWS = 72;
const SAMPLE_MS = 320;
const TRADE_WINDOW_MS = 90_000;
const BOOK_DEPTH = 25;

type TradePoint = {
  ts: number;
  price: number;
  vol: number;
  buy: boolean;
};

function applyBookSide(side: Map<string, number>, levels: [string, string, string][] | undefined) {
  if (!levels) return;
  for (const [price, vol] of levels) {
    const v = parseFloat(vol);
    if (!Number.isFinite(v) || v <= 0) side.delete(price);
    else side.set(price, v);
  }
}

function snapshotBook(
  bids: Map<string, number>,
  asks: Map<string, number>,
  book: { as?: [string, string, string][]; bs?: [string, string, string][] }
) {
  bids.clear();
  asks.clear();
  if (book.bs) {
    for (const [price, vol] of book.bs) {
      const v = parseFloat(vol);
      if (Number.isFinite(v) && v > 0) bids.set(price, v);
    }
  }
  if (book.as) {
    for (const [price, vol] of book.as) {
      const v = parseFloat(vol);
      if (Number.isFinite(v) && v > 0) asks.set(price, v);
    }
  }
}

function updateBook(
  bids: Map<string, number>,
  asks: Map<string, number>,
  book: { a?: [string, string, string][]; b?: [string, string, string][] }
) {
  if (book.b) applyBookSide(bids, book.b);
  if (book.a) applyBookSide(asks, book.a);
}

function bestBidAsk(bids: Map<string, number>, asks: Map<string, number>) {
  let bestBid = -Infinity;
  for (const p of bids.keys()) {
    const n = parseFloat(p);
    if (Number.isFinite(n) && n > bestBid) bestBid = n;
  }
  let bestAsk = Infinity;
  for (const p of asks.keys()) {
    const n = parseFloat(p);
    if (Number.isFinite(n) && n < bestAsk) bestAsk = n;
  }
  return { bestBid, bestAsk };
}

function priceToRow(price: number, priceMin: number, priceMax: number, rows: number): number {
  const t = (priceMax - price) / Math.max(priceMax - priceMin, 1e-9);
  const i = Math.floor(t * (rows - 1));
  return Math.max(0, Math.min(rows - 1, i));
}

function heatColor(t: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, t));
  if (x < 0.15) {
    const u = x / 0.15;
    return [Math.round(6 + 6 * u), Math.round(8 + 12 * u), Math.round(18 + 20 * u)];
  }
  if (x < 0.4) {
    const u = (x - 0.15) / 0.25;
    return [Math.round(12 + 40 * u), Math.round(20 + 70 * u), Math.round(38 + 80 * u)];
  }
  if (x < 0.65) {
    const u = (x - 0.4) / 0.25;
    return [Math.round(52 + 60 * u), Math.round(90 + 100 * u), Math.round(118 + 90 * u)];
  }
  if (x < 0.85) {
    const u = (x - 0.65) / 0.2;
    return [Math.round(112 + 100 * u), Math.round(190 + 40 * u), Math.round(208 + 30 * u)];
  }
  const u = (x - 0.85) / 0.15;
  return [Math.round(212 + 35 * u), Math.round(230 + 20 * u), Math.round(238 + 15 * u)];
}

function parseTradeSide(side: string): boolean {
  const s = side.toLowerCase();
  return s === 'buy' || s === 'b';
}

export function LiquidityHeatmapClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bidsRef = useRef(new Map<string, number>());
  const asksRef = useRef(new Map<string, number>());
  const heatmapRef = useRef<Float32Array[]>([]);
  const tradesRef = useRef<TradePoint[]>([]);
  const lastPriceRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  /** Browser timer id; avoid NodeJS.Timeout vs number mismatch under Next typings. */
  const reconnectRef = useRef<number | null>(null);
  const priceWindowRef = useRef({ min: 0, max: 1 });

  const [status, setStatus] = useState<'connecting' | 'live' | 'disconnected'>('connecting');
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const w = wrap.clientWidth;
    const h = Math.min(560, Math.max(380, Math.floor(window.innerHeight * 0.52)));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = w;
    const H = h;
    const padL = 8;
    const padR = 56;
    const padT = 8;
    const padB = 28;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, W, H);

    const heatmap = heatmapRef.current;
    const { min: priceMin, max: priceMax } = priceWindowRef.current;
    let maxHeat = 1e-9;
    for (const col of heatmap) {
      for (let r = 0; r < col.length; r++) {
        if (col[r] > maxHeat) maxHeat = col[r];
      }
    }

    const cellW = plotW / HEAT_COLS;
    const cellH = plotH / HEAT_ROWS;

    for (let c = 0; c < heatmap.length; c++) {
      const col = heatmap[c];
      const x0 = padL + c * cellW;
      for (let r = 0; r < HEAT_ROWS; r++) {
        const t = maxHeat > 0 ? col[r] / maxHeat : 0;
        const [R, G, B] = heatColor(Math.pow(t, 0.55));
        ctx.fillStyle = `rgb(${R},${G},${B})`;
        const y0 = padT + r * cellH;
        ctx.fillRect(x0, y0, Math.ceil(cellW) + 0.5, Math.ceil(cellH) + 0.5);
      }
    }

    const now = Date.now();
    const trades = tradesRef.current.filter((t) => now - t.ts <= TRADE_WINDOW_MS);
    tradesRef.current = trades;

    const xForTime = (ts: number) => {
      const u = (ts - (now - TRADE_WINDOW_MS)) / TRADE_WINDOW_MS;
      return padL + Math.max(0, Math.min(1, u)) * plotW;
    };
    const yForPrice = (price: number) => {
      const u = (priceMax - price) / Math.max(priceMax - priceMin, 1e-9);
      return padT + Math.max(0, Math.min(1, u)) * plotH;
    };

    const sorted = [...trades].sort((a, b) => a.ts - b.ts);
    if (sorted.length >= 2) {
      ctx.strokeStyle = 'rgba(180, 200, 220, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      let started = false;
      for (const tr of sorted) {
        const x = xForTime(tr.ts);
        const y = yForPrice(tr.price);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const m = Math.max(...sorted.map((t) => t.vol), 1e-6);
    for (const tr of sorted) {
      const x = xForTime(tr.ts);
      const y = yForPrice(tr.price);
      const rad = Math.min(22, 4 + Math.sqrt(tr.vol / m) * 18);
      ctx.fillStyle = tr.buy ? 'rgba(34, 197, 94, 0.82)' : 'rgba(239, 68, 68, 0.82)';
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const lp = lastPriceRef.current;
    if (lp && lp >= priceMin && lp <= priceMax) {
      const y = yForPrice(lp);
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(22, 101, 52, 0.95)';
      ctx.fillRect(padL + plotW + 2, y - 10, padR - 6, 20);
      ctx.fillStyle = '#ecfdf5';
      ctx.font = '11px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(lp.toFixed(2), padL + plotW + 6, y + 4);
    }

    ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
    ctx.font = '10px ui-sans-serif, system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const frac = i / 5;
      const price = priceMax - frac * (priceMax - priceMin);
      const y = padT + frac * plotH;
      ctx.fillText(price.toFixed(2), W - 4, y + 3);
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(100, 116, 139, 0.9)';
    const t0 = new Date(now - TRADE_WINDOW_MS);
    const t1 = new Date(now);
    ctx.fillText(
      `${t0.getHours().toString().padStart(2, '0')}:${t0.getMinutes().toString().padStart(2, '0')}`,
      padL + plotW * 0.12,
      H - 8
    );
    ctx.fillText(
      `${t1.getHours().toString().padStart(2, '0')}:${t1.getMinutes().toString().padStart(2, '0')}`,
      padL + plotW * 0.88,
      H - 8
    );
  }, []);

  useEffect(() => {
    if (heatmapRef.current.length !== HEAT_COLS) {
      heatmapRef.current = Array.from({ length: HEAT_COLS }, () => new Float32Array(HEAT_ROWS).fill(0));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let sampleTimer: number | null = null;
    let raf = 0;

    const pushColumn = () => {
      const bids = bidsRef.current;
      const asks = asksRef.current;
      const { bestBid, bestAsk } = bestBidAsk(bids, asks);
      const mid =
        lastPriceRef.current ??
        (Number.isFinite(bestBid) && Number.isFinite(bestAsk) && bestBid > -Infinity && bestAsk < Infinity
          ? (bestBid + bestAsk) / 2
          : null);
      if (mid === null) return;

      const span = Math.max(mid * 0.007, 14);
      const priceMin = mid - span;
      const priceMax = mid + span;
      priceWindowRef.current = { min: priceMin, max: priceMax };

      const col = new Float32Array(HEAT_ROWS);
      for (const [p, v] of bids) {
        const price = parseFloat(p);
        if (!Number.isFinite(price) || price < priceMin || price > priceMax) continue;
        const row = priceToRow(price, priceMin, priceMax, HEAT_ROWS);
        col[row] += v;
      }
      for (const [p, v] of asks) {
        const price = parseFloat(p);
        if (!Number.isFinite(price) || price < priceMin || price > priceMax) continue;
        const row = priceToRow(price, priceMin, priceMax, HEAT_ROWS);
        col[row] += v;
      }

      const h = heatmapRef.current;
      h.push(col);
      if (h.length > HEAT_COLS) h.shift();
    };

    const loopDraw = () => {
      draw();
      raf = requestAnimationFrame(loopDraw);
    };

    const connect = () => {
      if (cancelled) return;
      setError(null);
      setStatus('connecting');
      const ws = new WebSocket(KRAKEN_WS);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        setStatus('live');
        ws.send(
          JSON.stringify({
            event: 'subscribe',
            pair: [KRAKEN_PAIR],
            subscription: { name: 'book', depth: BOOK_DEPTH },
          })
        );
        ws.send(
          JSON.stringify({
            event: 'subscribe',
            pair: [KRAKEN_PAIR],
            subscription: { name: 'trade' },
          })
        );
      };

      ws.onmessage = (ev) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(ev.data as string);
          if (msg.event === 'heartbeat' || msg.event === 'systemStatus') return;
          if (msg.event === 'subscriptionStatus' && msg.status !== 'subscribed') {
            if (msg.errorMessage) setError(String(msg.errorMessage));
          }
          if (!Array.isArray(msg)) return;
          const bookOrTrade = msg[1];
          const pair = msg[2];
          const chan = msg[3];
          if (pair !== KRAKEN_PAIR) return;

          if (chan && String(chan).startsWith('book')) {
            if (bookOrTrade && typeof bookOrTrade === 'object') {
              const b = bookOrTrade as {
                as?: [string, string, string][];
                bs?: [string, string, string][];
                a?: [string, string, string][];
                b?: [string, string, string][];
              };
              if (b.as || b.bs) snapshotBook(bidsRef.current, asksRef.current, b);
              else if (b.a || b.b) updateBook(bidsRef.current, asksRef.current, b);
            }
          } else if (chan === 'trade' && Array.isArray(bookOrTrade)) {
            for (const row of bookOrTrade as [string, string, string, string, string, string][]) {
              const [priceStr, volStr, timeStr, side] = row;
              const price = parseFloat(priceStr);
              const vol = parseFloat(volStr);
              const timeSec = parseFloat(timeStr);
              if (!Number.isFinite(price) || !Number.isFinite(vol)) continue;
              lastPriceRef.current = price;
              setLastPrice(price);
              const tsMs = Number.isFinite(timeSec) ? Math.round(timeSec * 1000) : Date.now();
              tradesRef.current.push({
                ts: tsMs,
                price,
                vol,
                buy: parseTradeSide(side ?? 'sell'),
              });
            }
          }
        } catch {
          /* ignore */
        }
      };

      ws.onerror = () => {
        if (!cancelled) setError('WebSocket error');
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (cancelled) return;
        setStatus('disconnected');
        reconnectRef.current = window.setTimeout(connect, 2500);
      };
    };

    connect();
    sampleTimer = window.setInterval(pushColumn, SAMPLE_MS);
    raf = requestAnimationFrame(loopDraw);

    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);

    return () => {
      cancelled = true;
      if (sampleTimer) clearInterval(sampleTimer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [draw]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium ${
            status === 'live'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              : status === 'connecting'
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/35 dark:text-amber-200'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current opacity-90 animate-pulse" aria-hidden />
          {status === 'live' ? 'Live' : status === 'connecting' ? 'កំពុងភ្ជាប់…' : 'ផ្តាច់'}
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          {KRAKEN_PAIR} · Kraken · កំណត់សំណុំ: <span className="font-mono tabular-nums">{BOOK_DEPTH}</span>
        </span>
        {lastPrice != null && (
          <span className="text-gray-900 dark:text-white font-mono tabular-nums">
            ថ្លៃចុងក្រោយ <span className="text-emerald-600 dark:text-emerald-400">{lastPrice.toFixed(2)}</span>
          </span>
        )}
        {error && <span className="text-rose-600 dark:text-rose-400 text-xs">{error}</span>}
      </div>

      <div
        ref={wrapRef}
        className="rounded-xl border border-gray-700/80 bg-[#05070c] overflow-hidden shadow-inner min-h-[380px]"
      >
        <canvas ref={canvasRef} className="block w-full touch-none" aria-label="ផែនទីសេរីភាពតាមពេលវេលា" />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        ផ្ទៃខាងលើបង្ហាញភាគរួមសម្ពាធលិមីតការណ៍ (bids + asks) តាមកម្រិតតម្លៃក្នុងរយៈពេល ~{Math.round((HEAT_COLS * SAMPLE_MS) / 1000)}
        វិនាទី។ រង្វង់បង្ហាញការជួញដូរជាក់ស្តែង — ផ្នែកបៃតិងខៀវ = ទិញ ក្រហម = លក់ (taker side)។{' '}
        <strong className="text-gray-700 dark:text-gray-300">សូមចាំ</strong>៖ ទិន្នន័យមកពី Kraken <span className="font-mono">XAUT/USD</span>{' '}
        (Tether Gold) មិនមែនជាការភ្ជាប់ស្ទាត់ XAU/USD របស់ឈ្មួញ FX ផ្ទាល់ខាងទេ។
      </p>
    </div>
  );
}
