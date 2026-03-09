'use client';

import React, { useState, useEffect } from 'react';

// Cambodia uses ICT (Indochina Time) = UTC+7, no daylight saving
const CAMBODIA_UTC_OFFSET = 7;

// Session times in UTC (hour ranges; overnight sessions use nextDay)
type Session = {
  id: string;
  name: string;
  nameKm?: string;
  city: string;
  openUtc: number; // 0-23
  closeUtc: number; // 0-23 (exclusive for non-overnight; for overnight, close < open means next day)
  flag: string;
  color: string;
};

const SESSIONS: Session[] = [
  { id: 'sydney', name: 'Sydney', nameKm: 'ស៊ីដនី', city: 'Sydney', openUtc: 22, closeUtc: 7, flag: '🇦🇺', color: 'emerald' },
  { id: 'asian', name: 'Asian', nameKm: 'អាស៊ី', city: 'Tokyo', openUtc: 0, closeUtc: 9, flag: '🇯🇵', color: 'blue' },
  { id: 'london', name: 'London', nameKm: 'ឡុងដ៍', city: 'London', openUtc: 8, closeUtc: 17, flag: '🇬🇧', color: 'amber' },
  { id: 'newyork', name: 'New York', nameKm: 'ញូវយ៉ក', city: 'New York', openUtc: 13, closeUtc: 22, flag: '🇺🇸', color: 'violet' },
  { id: 'london-ny-overlap', name: 'London–NY Overlap', nameKm: 'ឡុងដ៍–ញូវយ៉ក', city: 'Peak', openUtc: 13, closeUtc: 17, flag: '⚡', color: 'rose' },
];

function isSessionOpen(session: Session, utcHour: number): boolean {
  const { openUtc, closeUtc } = session;
  if (closeUtc > openUtc) {
    return utcHour >= openUtc && utcHour < closeUtc;
  }
  // Overnight: e.g. Sydney 22–07 → open if hour >= 22 or hour < 7
  return utcHour >= openUtc || utcHour < closeUtc;
}

function utcToIct(utcHour: number): number {
  return (utcHour + CAMBODIA_UTC_OFFSET) % 24;
}

function formatIctTime(openUtc: number, closeUtc: number): string {
  const fmt = (h: number) => (h < 10 ? `0${h}` : `${h}`) + ':00';
  const openIct = utcToIct(openUtc);
  const closeIct = utcToIct(closeUtc);
  const overnight = closeUtc > openUtc ? closeIct < openIct : true;
  return overnight ? `${fmt(openIct)} – ${fmt(closeIct)} (+1d)` : `${fmt(openIct)} – ${fmt(closeIct)}`;
}

// Asia/Phnom_Penh is Cambodia (ICT = UTC+7)
const CAMBODIA_TZ = 'Asia/Phnom_Penh';

export function TradingSessionZone() {
  const [utcHour, setUtcHour] = useState(0);
  const [ictNow, setIctNow] = useState('--:--:--');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setUtcHour(d.getUTCHours());
      setIctNow(d.toLocaleTimeString('en-GB', { timeZone: CAMBODIA_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside
      className="shrink-0 w-full lg:w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
      aria-label="Trading sessions"
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          តំបន់ (Session Zone)
        </h3>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 tabular-nums" suppressHydrationWarning>
          កម្ពុជា {ictNow} (ICT)
        </p>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {SESSIONS.map((session) => {
          const open = isSessionOpen(session, utcHour);
          const colorClasses = {
            emerald: open ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400',
            blue: open ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400',
            amber: open ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400',
            violet: open ? 'bg-violet-500/15 text-violet-700 dark:text-violet-400' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400',
            rose: open ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400',
          }[session.color];
          return (
            <li key={session.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0" aria-hidden>{session.flag}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {session.name}
                    </p>
                    <p className="text-xs text-gray-900 dark:text-gray-200">
                      {formatIctTime(session.openUtc, session.closeUtc)} ICT
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${colorClasses}`}
                >
                  {open ? 'បើក' : 'បិទ'}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
