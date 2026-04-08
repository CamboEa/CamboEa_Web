import { LiquidityHeatmapClient } from '@/components/features/markets/LiquidityHeatmapClient';

export const metadata = {
  title: 'ផែនទីសេរីភាព (XAUT) | CamboEA',
  description:
    'មើលសម្ពាធលិមីតការណ៍និងការជួញដូរជាក់ស្តែងលើ Kraken XAUT/USD — ផ្ទៃការណ៌កម្តៅ និងរង្វង់ទិញ/លក់។',
};

export default function LiquidityHeatmapPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-linear-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">ផែនទីសេរីភាព (Liquidity heatmap)</h1>
          <p className="mt-3 text-slate-300 max-w-3xl leading-relaxed">
            ប្រវែងពេលវេលា (ឈរ) និងតម្លៃ (ទល់) — ពណ៌ភ្លឺជាកន្លែងមាន limit orders ច្រើន។ ចំណុចចរនាច់បង្ហាញការជួញដូរជាក់ស្តែង (ខៀវ = taker buy, ក្រហម = taker sell)។ ទិន្នន័យ{' '}
            <span className="font-mono text-slate-200">XAUT/USD</span> ពី Kraken។
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <LiquidityHeatmapClient />
      </section>
    </main>
  );
}
