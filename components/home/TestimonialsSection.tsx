import React from 'react';
import { Card, CardContent } from '@/components/ui';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    role: 'Professional Trader',
    company: 'Goldman Sachs',
    content: 'The market analysis and real-time updates have significantly improved my trading decisions. Best finance news platform I\'ve used.',
    rating: 5,
    avatar: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Crypto Investor',
    company: 'Independent',
    content: 'Comprehensive crypto coverage with accurate data. The expert insights help me stay ahead of market trends.',
    rating: 5,
    avatar: 'MC',
  },
  {
    name: 'Emma Williams',
    role: 'Financial Analyst',
    company: 'JP Morgan',
    content: 'Professional-grade content that\'s accessible and timely. The newsletter alone is worth subscribing for.',
    rating: 5,
    avatar: 'EW',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Professionals
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of traders and investors who rely on our platform daily
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <Card
              key={testimonial.name}
              variant="bordered"
              className="hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
