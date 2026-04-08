import { MyfxbookEconomicCalendarWidget } from '@/components/features/markets/widgets/MyfxbookWidgets';

export const metadata = {
  title: 'ប្រតិទិនសេដ្ឋកិច្ច | CamboEA',
  description: 'ព្រឹត្តិការណ៍សេដ្ឋកិច្ចសប្តាហ៍នេះ៖ ការចេញផ្សាយ ការថ្លែងយោបល់ និងទិន្នន័យសំខាន់។ រៀបចំធ្វើដូចជុំវិញព័ត៌មានឥទ្ធិពលខ្ពស់។',
};

export default function EconomicCalendarPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-linear-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">ប្រតិទិនសេដ្ឋកិច្ច</h1>
          <p className="text-slate-300 max-w-2xl">
            តាមដានព្រឹត្តិការណ៍សេដ្ឋកិច្ចសំខាន់ៗ និងកម្រិតផលប៉ះពាល់។
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Economic Calendar</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              តាមដានព្រឹត្តិការណ៍សេដ្ឋកិច្ចសំខាន់ៗ និងកម្រិតផលប៉ះពាល់។
            </p>
          </div>
          <div className="p-3 sm:p-4">
            <MyfxbookEconomicCalendarWidget height={620} />
          </div>
        </div>
      </section>
    </main>
  );
}
