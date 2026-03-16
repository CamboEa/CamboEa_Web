'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TradingSessionZone } from '@/components/features/markets/TradingSessionZone';

export interface CalendarEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
  actual?: string;
  usualEffect?: string;
}

const CAMBODIA_TZ = 'Asia/Phnom_Penh';

function formatEventTime(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleString('km-KH', {
    timeZone: CAMBODIA_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatEventDateOnly(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('km-KH', {
    timeZone: CAMBODIA_TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Normalize API date (e.g. "2026-03-16T04:30:00+07:00") to YYYY-MM-DD for grouping. */
function getEventDateKey(isoDate: string): string {
  if (!isoDate || typeof isoDate !== 'string') return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate.slice(0, 10);
  return d.toLocaleDateString('en-CA', { timeZone: CAMBODIA_TZ });
}

/** Today's date in Cambodia (ICT) as YYYY-MM-DD. */
function getLocalDateKey(d: Date = new Date()) {
  return d.toLocaleDateString('en-CA', { timeZone: CAMBODIA_TZ });
}

const IMPACT_LABELS: Record<string, string> = {
  High: 'ខ្ពស់',
  Medium: 'មធ្យម',
  Low: 'ទាប',
  Holiday: 'ថ្ងៃសម្រាក',
};

const USUAL_EFFECT_KM: Record<string, string> = {
  "'Actual' greater than 'Forecast' is good for currency;": "តម្លៃ 'ថ្មី' ខ្ពស់ជាង 'ព្យាករណ៍' គឺល្អចំពោះរូបិយប័ណ្ណ។",
  "'Actual' greater than 'Forecast' is good for currency": "តម្លៃ 'ថ្មី' ខ្ពស់ជាង 'ព្យាករណ៍' គឺល្អចំពោះរូបិយប័ណ្ណ។",
  "'Actual' less than 'Forecast' is good for currency;": "តម្លៃ 'ថ្មី' ទាបជាង 'ព្យាករណ៍' គឺល្អចំពោះរូបិយប័ណ្ណ។",
  "'Actual' less than 'Forecast' is good for currency": "តម្លៃ 'ថ្មី' ទាបជាង 'ព្យាករណ៍' គឺល្អចំពោះរូបិយប័ណ្ណ។",
  "More hawkish than expected is good for currency;": "គោលនយោបាយរឹងជាងរំពឹងគឺល្អចំពោះរូបិយប័ណ្ណ។",
  "More hawkish than expected is good for currency": "គោលនយោបាយរឹងជាងរំពឹងគឺល្អចំពោះរូបិយប័ណ្ណ។",
  "No consistent effect - there are both risk and growth implications;":
    "ឥទ្ធិពលមិនថេរ - មានទាំងហានិភ័យ និងកំណើនសេដ្ឋកិច្ច។",
  "No consistent effect - there are both risk and growth implications":
    "ឥទ្ធិពលមិនថេរ - មានទាំងហានិភ័យ និងកំណើនសេដ្ឋកិច្ច។",
};

function usualEffectToKhmer(text: string | undefined): string {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();
  return USUAL_EFFECT_KM[trimmed] ?? trimmed;
}

function ImpactBadge({ impact }: { impact: string }) {
  const style =
    impact === 'High'
      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      : impact === 'Medium'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        : impact === 'Holiday'
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {IMPACT_LABELS[impact] ?? impact}
    </span>
  );
}

const WEEKDAYS = ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'ស', 'សៅ'];

function MiniCalendar({
  selectedDate,
  onSelectDate,
  datesWithEvents,
}: {
  selectedDate: string;
  onSelectDate: (key: string) => void;
  datesWithEvents: Set<string>;
}) {
  const [hasMounted, setHasMounted] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    setViewDate((prev) => {
      if (prev.getFullYear() === y && prev.getMonth() === m - 1) return prev;
      return new Date(y, m - 1, 1);
    });
  }, [selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = hasMounted
    ? viewDate.toLocaleDateString('km-KH', { month: 'long', year: 'numeric' })
    : `${year}-${String(month + 1).padStart(2, '0')}`;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const goPrev = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNext = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{monthName}</span>
        <button
          type="button"
          onClick={goNext}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = key === selectedDate;
          const hasEvents = datesWithEvents.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              className={`
                py-1.5 rounded text-sm
                ${isSelected ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'}
                ${hasEvents && !isSelected ? 'font-medium' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onSelectDate(getLocalDateKey())}
        className="mt-3 w-full py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
      >
        ថ្ងៃនេះ
      </button>
    </div>
  );
}

export function EconomicCalendarClient({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const todayKey = getLocalDateKey();
  const datesWithEvents = useMemo(() => {
    const set = new Set<string>();
    initialEvents.forEach((e) => set.add(getEventDateKey(e.date)));
    return set;
  }, [initialEvents]);

  const defaultSelectedDate = todayKey;

  const [selectedDate, setSelectedDate] = useState<string>(defaultSelectedDate);
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [detailPopupEvent, setDetailPopupEvent] = useState<CalendarEvent | null>(null);

  const countries = useMemo(() => {
    const set = new Set(initialEvents.map((e) => e.country));
    return Array.from(set).sort();
  }, [initialEvents]);

  const filtered = useMemo(() => {
    return initialEvents.filter((e) => {
      if (getEventDateKey(e.date) !== selectedDate) return false;
      if (impactFilter !== 'all' && e.impact !== impactFilter) return false;
      if (countryFilter !== 'all' && e.country !== countryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!e.title.toLowerCase().includes(q) && !e.country.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [initialEvents, selectedDate, impactFilter, countryFilter, search]);

  const sortedEvents = useMemo(
    () => [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [filtered]
  );

  const selectedDateLabel = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('km-KH', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <>
      <section className="bg-linear-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">ប្រតិទិនសេដ្ឋកិច្ច</h1>
          <p className="text-slate-300 max-w-2xl">
            ព្រឹត្តិការណ៍សេដ្ឋកិច្ចសប្តាហ៍នេះ។ ជ្រើសរើសថ្ងៃលើប្រតិទិន និងចម្រោះតាមឥទ្ធិពល ឬប្រទេស។
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 shrink-0 order-1">
            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              datesWithEvents={datesWithEvents}
            />
          </aside>

          <div className="flex-1 min-w-0 order-2">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="search"
                placeholder="ស្វែងរកព្រឹត្តិការណ៍..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ឥទ្ធិពលទាំងអស់</option>
                <option value="High">ខ្ពស់</option>
                <option value="Medium">មធ្យម</option>
                <option value="Low">ទាប</option>
                <option value="Holiday">ថ្ងៃសម្រាក</option>
              </select>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ប្រទេសទាំងអស់</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3" suppressHydrationWarning>
              {selectedDateLabel}
            </h2>

            {sortedEvents.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
                គ្មានព្រឹត្តិការណ៍សម្រាប់ថ្ងៃនេះ។
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                          ម៉ោង
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                          ព្រឹត្តិការណ៍
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                          ឥទ្ធិពល
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                          លម្អិត
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                          ព្យាករណ៍
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                          ថ្មី
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                          មុន
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEvents.map((event, i) => (
                        <tr
                          key={`${event.date}-${event.title}-${i}`}
                          className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <td className="py-2 px-2 text-gray-600 dark:text-gray-400 whitespace-nowrap" suppressHydrationWarning>
                            {formatEventTime(event.date)}
                          </td>
                          <td className="py-2 px-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </span>
                            <span className="ml-1 text-gray-500 dark:text-gray-400">
                              ({event.country})
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <ImpactBadge impact={event.impact} />
                          </td>
                          <td className="py-2 px-2 hidden sm:table-cell">
                            <button
                              type="button"
                              onClick={() => setDetailPopupEvent(event)}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              aria-label="លម្អិត"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                            </button>
                          </td>
                          <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                            {event.forecast || '-'}
                          </td>
                          <td className="py-2 px-2 font-medium text-gray-900 dark:text-white">
                            {event.actual || '-'}
                          </td>
                          <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                            {event.previous || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:w-72 shrink-0 order-3 lg:sticky lg:top-6 lg:self-start">
            <TradingSessionZone selectedDate={selectedDate} />
          </aside>
        </div>
      </section>

      {detailPopupEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setDetailPopupEvent(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-popup-title"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-5 border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="detail-popup-title" className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              {detailPopupEvent.title} ({detailPopupEvent.country})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {usualEffectToKhmer(detailPopupEvent.usualEffect) || 'គ្មានព័ត៌មានឥទ្ធិពលធម្មតា។'}
            </p>
            <button
              type="button"
              onClick={() => setDetailPopupEvent(null)}
              className="mt-4 w-full py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              បិទ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
