import { EconomicCalendarClient, type CalendarEvent } from '@/app/calendar/EconomicCalendarClient';

const API_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';

export const metadata = {
  title: 'ប្រតិទិនសេដ្ឋកិច្ច | CamboEA',
  description: 'ព្រឹត្តិការណ៍សេដ្ឋកិច្ចសប្តាហ៍នេះ៖ ការចេញផ្សាយ ការថ្លែងយោបល់ និងទិន្នន័យសំខាន់។ រៀបចំធ្វើដូចជុំវិញព័ត៌មានឥទ្ធិពលខ្ពស់។',
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
