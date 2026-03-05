'use client';

import React, { useEffect, useMemo, useState } from 'react';

export interface CalendarEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

function formatEventTime(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatEventDateOnly(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getEventDateKey(isoDate: string) {
  return isoDate.slice(0, 10);
}

function getLocalDateKey(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function ImpactBadge({ impact }: { impact: string }) {
  const style =
    impact === 'High'
      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      : impact === 'Medium'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {impact}
    </span>
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MiniCalendar({
  selectedDate,
  onSelectDate,
  datesWithEvents,
}: {
  selectedDate: string;
  onSelectDate: (key: string) => void;
  datesWithEvents: Set<string>;
}) {
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  useEffect(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    setViewDate((prev) => {
      if (prev.getFullYear() === y && prev.getMonth() === m - 1) return prev;
      return new Date(y, m - 1, 1);
    });
  }, [selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
        Today
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

  const defaultSelectedDate = useMemo(() => {
    if (datesWithEvents.has(todayKey)) return todayKey;
    const sorted = Array.from(datesWithEvents).sort();
    return sorted[0] ?? todayKey;
  }, [datesWithEvents, todayKey]);

  const [selectedDate, setSelectedDate] = useState<string>(defaultSelectedDate);
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

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
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Economic Calendar</h1>
          <p className="text-slate-300 max-w-2xl">
            This week&apos;s economic events. Pick a date on the calendar and filter by impact or country.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 shrink-0">
            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              datesWithEvents={datesWithEvents}
            />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="search"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All impact</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              {selectedDateLabel}
            </h2>

            {sortedEvents.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
                No events for this date.
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Time
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Event
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Impact
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Forecast
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Previous
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEvents.map((event, i) => (
                        <tr
                          key={`${event.date}-${event.title}-${i}`}
                          className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {formatEventTime(event.date)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </span>
                            <span className="ml-2 text-gray-500 dark:text-gray-400">
                              ({event.country})
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <ImpactBadge impact={event.impact} />
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {event.forecast || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
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
        </div>
      </section>
    </>
  );
}
