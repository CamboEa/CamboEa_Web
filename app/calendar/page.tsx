import { EconomicCalendarClient, type CalendarEvent } from '@/app/calendar/EconomicCalendarClient';

const API_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';

export const metadata = {
  title: 'Economic Calendar | Forex & Crypto News',
  description: 'This week\'s economic events: releases, speeches, and key data. Plan your trading around high-impact news.',
};

async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function EconomicCalendarPage() {
  const events = await getCalendarEvents();
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EconomicCalendarClient initialEvents={events} />
    </main>
  );
}
