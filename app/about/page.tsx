import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';

const VALUES = [
  {
    title: 'ភាពអាចទុកចិត្តបាន',
    titleEn: 'Trust',
    description: 'យើងផ្តល់ព័ត៌មាន និងការវិភាគដែលមានប្រភពច្បាស់លាស់ និងអាចផ្ទៀងផ្ទាត់បាន ដើម្បីជួយអ្នកសម្រេចចិត្តធ្វើដូចដោយច្បាស់។',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'ភាពត្រឹមត្រូវ',
    titleEn: 'Accuracy',
    description: 'ការវិភាគ និងទិន្នន័យរបស់យើងត្រូវបានធ្វើឡើងដោយយកចិត្តទុកដាក់ ដើម្បីឱ្យអ្នកនៅចម្ងាយមុខជាមួយទីផ្សារ។',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'ផ្តោតលើកម្ពុជា',
    titleEn: 'Local focus',
    description: 'យើងបកប្រែ និងរៀបចំខ្លឹមសារសម្រាប់អ្នកធ្វើដូច និងវិនិយោគិនខ្មែរ ដើម្បីឱ្យអ្នកទទួលបានព័ត៌មានសកលដោយងាយ។',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const OFFERINGS = [
  {
    title: 'ព័ត៌មានដែលផ្តល់ឥទ្ធិពលដល់ទីផ្សារ',
    href: '/markets',
    description: 'តាមដានព្រឹត្តិការណ៍សកល និងទិន្នន័យដែលរំញោចគូប្រាក់ មាស និងគ្រីបធ័។',
  },
  {
    title: 'ការវិភាគអ្នកជំនាញ',
    href: '/analysis',
    description: 'ការវិភាគទីផ្សារ និងសញ្ញាធ្វើដូចពីអ្នកជំនាញ ដើម្បីជួយអ្នកយល់ដឹងឱ្យបានច្បាស់។',
  },
  {
    title: 'ព័ត៌មានចុងក្រោយ',
    href: '/news',
    description: 'ព័ត៌មានហិរញ្ញវត្ថុ និងទីផ្សារដែលធ្វើបច្ចុប្បន្នភាពជាប្រចាំ។',
  },
  {
    title: 'ប្រតិទិនសេដ្ឋកិច្ច',
    href: '/calendar',
    description: 'ប្រតិទិនព្រឹត្តិការណ៍សំខាន់ៗ ដើម្បីរៀបចំធ្វើដូចរបស់អ្នក។',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-sky-400/5 via-transparent to-blue-600/5" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="text-sky-600 dark:text-sky-400 font-semibold mb-3">អំពីយើង</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 max-w-4xl">
            CamboEA — ច្រកចូលទៅកាន់ទីផ្សារឆ្លាតវៃ
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            យើងជាប្រភពព័ត៌មានហិរញ្ញវត្ថុដែលអ្នកទុកចិត្តបានសម្រាប់ព័ត៌មានពិភពលោកដែលផ្តល់ឥទ្ធិពលដល់គូប្រាក់ មាស និងគ្រីបធ័ ការវិភាគអ្នកជំនាញ និងសញ្ញាធ្វើដូច។
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              បេសកម្មរបស់យើង
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
              CamboEA កើតឡើងដើម្បីធ្វើឱ្យព័ត៌មានហិរញ្ញវត្ថុសកល និងការវិភាគទីផ្សារអាចចូលដំណើរការបានយ៉ាងងាយស្រួលសម្រាប់អ្នកធ្វើដូច និងវិនិយោគិនខ្មែរ។ យើងជឿថាការធ្វើដូចដែលមានព័ត៌មានគ្រប់គ្រាន់ និងវិភាគច្បាស់លាស់អាចជួយអ្នកធ្វើឱ្យការសម្រេចចិត្តរបស់អ្នកកាន់តែឆ្លាតវៃ។
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              យើងផ្តោតលើគូប្រាក់ (Forex) មាស (Gold) និងគ្រីបធ័ (Crypto) — ទីផ្សារដែលអ្នកចាប់អារម្មណ៍ជាងគេ — និងផ្តល់ខ្លឹមសារជាភាសាខ្មែរ និងអង់គ្លេសដើម្បីគាំទ្រដល់សហគមន៍របស់យើង។
            </p>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            យើងផ្តល់អ្វីខ្លះ
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
            ព័ត៌មាន ការវិភាគ និងឧបករណ៍ដែលអ្នកត្រូវការដើម្បីនៅចម្ងាយមុខជាមួយទីផ្សារ។
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {OFFERINGS.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card variant="bordered" className="h-full hover:border-sky-500/50 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-sky-600 dark:text-sky-400">
                      រកមើល
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            តម្លៃដែលយើងជឿ
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
            យើងធ្វើការដោយគោរពតាមគោលការណ៍ទាំងនេះ ដើម្បីឱ្យអ្នកទទួលបានខ្លឹមសារដែលអាចទុកចិត្តបាន។
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {VALUES.map((value) => (
              <Card key={value.titleEn} variant="bordered" className="h-full">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-linear-to-br from-sky-400 to-blue-600 text-white w-fit mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {value.title} <span className="text-gray-500 dark:text-gray-400 font-normal">/ {value.titleEn}</span>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ចង់ទំនាក់ទំនងជាមួយយើង?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            សូមចូលមករកយើងចំពោះសំណួរ ការណែនាំ ឬការសហការ។
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              ទំនាក់ទំនង
            </Link>
            <Link
              href="/markets"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              រកមើលទីផ្សារ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
