'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, AnimatedSection } from '@/components/ui';

interface Category {
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  articles: number;
}

const CATEGORIES: Category[] = [
  {
    name: 'Forex Trading',
    description: 'Currency pairs, market analysis, and trading strategies',
    href: '/forex',
    color: 'from-green-500 to-emerald-600',
    articles: 245,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Cryptocurrency',
    description: 'Bitcoin, altcoins, blockchain technology, and crypto markets',
    href: '/crypto',
    color: 'from-orange-500 to-red-600',
    articles: 312,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Trading Signals',
    description: 'Expert entry/exit points with stop loss and take profit levels',
    href: '/analysis',
    color: 'from-purple-500 to-pink-600',
    articles: 189,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: 'Economic Calendar',
    description: 'This week\'s economic events, releases, and high-impact news',
    href: '/calendar',
    color: 'from-blue-500 to-cyan-600',
    articles: 0,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export const CategorySection = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection animation="fade-in-up" className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
            EXPLORE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Explore by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Dive deep into specialized content tailored to your interests
          </p>
        </AnimatedSection>

        {/* Category Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category, index) => (
            <AnimatedSection key={category.name} animation="fade-in-up" delay={index * 100}>
              <Link href={category.href}>
                <Card
                  variant="bordered"
                  className="h-full hover-lift cursor-pointer group overflow-hidden relative"
                >
                  {/* Animated Gradient Background */}
                  <div className={`absolute inset-0 bg-linear-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                  </div>

                  <CardContent className="p-6 relative">
                    {/* Icon with Glow */}
                    <div className={`relative inline-flex p-4 rounded-2xl bg-linear-to-br ${category.color} text-white mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      {category.icon}
                      {/* Glow Effect */}
                      <div className={`absolute inset-0 rounded-2xl bg-linear-to-br ${category.color} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10`}></div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {category.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {category.articles} articles
                      </span>
                      <div className="flex items-center gap-1 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};
