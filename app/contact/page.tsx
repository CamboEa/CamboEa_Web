import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { ContactForm } from '@/components/contact/ContactForm';

const CONTACT_INFO = [
  {
    title: 'អ៉ីមែល',
    titleEn: 'Email',
    value: 'hello@camboea.com',
    href: 'mailto:hello@camboea.com',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'ទូរស័ព្ទ',
    titleEn: 'Phone',
    value: '+855 XX XXX XXXX',
    href: 'tel:+85500000000',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    title: 'ទីតាំង',
    titleEn: 'Location',
    value: 'ភ្នំពេញ, កម្ពុជា',
    href: null,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-sky-400/5 via-transparent to-blue-600/5" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="text-sky-600 dark:text-sky-400 font-semibold mb-3">ទំនាក់ទំនង</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 max-w-4xl">
            ទំនាក់ទំនងជាមួយយើង
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            មានសំណួរ ការណែនាំ ឬចង់សហការជាមួយយើង? សូមផ្ញើសារមកយើង យើងនឹងឆ្លើយតបឆាប់តាមអាចធ្វើបាន។
          </p>
        </div>
      </section>

      {/* Contact info + Form */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Contact info */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                ព័ត៌មានទំនាក់ទំនង
              </h2>
              <div className="space-y-6">
                {CONTACT_INFO.map((item) => (
                  <div key={item.titleEn} className="flex gap-4">
                    <div className="p-3 rounded-xl bg-linear-to-br from-sky-400 to-blue-600 text-white shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.title} / {item.titleEn}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="font-medium text-gray-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card variant="bordered" className="border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    ផ្ញើសារមកយើង
                  </h2>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
