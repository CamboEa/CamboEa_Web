'use client';

export function MyfxbookForexRatesWidget({ height = 430 }: { height?: number }) {
  return (
    <div className="space-y-2">
      <div style={{ height }}>
        <iframe
          src="https://widget.myfxbook.com/widget/market-quotes.html?symbols=XAUUSD,XAGAUD,EURGBP,EURUSD,GBPJPY,GBPUSD,USDJPY"
          style={{ border: 0, width: '100%', height: '100%' }}
          title="Forex Rates"
          loading="lazy"
        />
      </div>
      <div className="mt-2" />
    </div>
  );
}

export function MarketDepthHelpSection() {
  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/20 p-4">
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
        ព័ត៌មាននេះជួយ Trade របៀបណា?
      </h3>
      <div className="grid sm:grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-medium text-gray-900 dark:text-white mb-1.5">Level 1 — តម្លៃដេញថ្លៃ / យល់ព្រម / ថ្លៃចុងក្រោយ</p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            បង្ហាញតម្លៃដេញថ្លៃ (Bid) និងយល់ព្រម (Ask) ល្អបំផុត រួមទាំងថ្លៃចុងក្រោយ និងចន្លោះ (Spread)។
            ជួយអ្នកវាយតម្លៃថ្លៃធ្វើដំណើរ ពេលវេលាចូល-ចេញដែលសមរម្យ និងថ្លៃដែលទីផ្សារពិតជាធ្វើដំណើរនៅពេលនេះ។
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white mb-1.5">Level 2 — ជម្រៅទីផ្សារ (Order Book)</p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            បង្ហាញបញ្ជីដេញថ្លៃ និងយល់ព្រមជាច្រើនកម្រិត។
            ជួយអ្នកមើលថាមានការគាំទ្រ ឬការទប់ទល់នៅតម្លៃណា តើមានសារៈសំខាន់ប៉ុណ្ណានៅជិតតម្លៃបច្ចុប្បន្ន និងធ្វើឱ្យអ្នករៀបចំការចូល-ចេញឱ្យប្រសើរ។
          </p>
        </div>
      </div>
    </div>
  );
}
