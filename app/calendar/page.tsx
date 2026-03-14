import { EconomicCalendarClient, type CalendarEvent } from '@/app/calendar/EconomicCalendarClient';

const API_URL = 'https://cambo-ea-scrap.vercel.app/api/events';

type ApiDetail = {
  next_release?: string;
  usual_effect?: string;
  frequency?: string;
} | null;

type ApiEvent = {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
  actual: string;
  detail: ApiDetail;
};

async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const events: ApiEvent[] = data?.events ?? [];
    return events.map((e) => ({
      title: e.title,
      country: e.country,
      date: e.date,
      impact: e.impact,
      forecast: e.forecast ?? '',
      previous: e.previous ?? '',
      actual: e.actual ?? '',
      usualEffect: e.detail?.usual_effect ?? undefined,
    }));
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'ប្រតិទិនសេដ្ឋកិច្ច | CamboEA',
  description: 'ព្រឹត្តិការណ៍សេដ្ឋកិច្ចសប្តាហ៍នេះ៖ ការចេញផ្សាយ ការថ្លែងយោបល់ និងទិន្នន័យសំខាន់។ រៀបចំធ្វើដូចជុំវិញព័ត៌មានឥទ្ធិពលខ្ពស់។',
};

export default async function EconomicCalendarPage() {
  const events = await getCalendarEvents();
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EconomicCalendarClient initialEvents={events} />
    </main>
  );
}
