'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { AnimatedSection, AnimatedCounter } from '@/components/ui/AnimatedSection';

interface Stat {
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

const STATS: Stat[] = [
  {
    label: 'Total Market Cap',
    value: 2.1,
    suffix: 'T',
    prefix: '$',
    change: '+5.2%',
    isPositive: true,
    color: 'from-blue-500 to-cyan-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: '24h Trading Volume',
    value: 156,
    suffix: 'B',
    prefix: '$',
    change: '+12.8%',
    isPositive: true,
    color: 'from-green-500 to-emerald-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: 'Active Traders',
    value: 1.2,
    suffix: 'M',
    change: '+8.4%',
    isPositive: true,
    color: 'from-purple-500 to-pink-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: 'Markets Tracked',
    value: 500,
    suffix: '+',
    change: '+15',
    isPositive: true,
    color: 'from-orange-500 to-red-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export const StatsSection = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {STATS.map((stat, index) => (
            <AnimatedSection key={stat.label} animation="fade-in-up" delay={index * 100}>
              <Card
                variant="bordered"
                className="hover-lift cursor-pointer group relative overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-linear-to-br ${stat.color} rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                      stat.isPositive 
                        ? 'text-green-600 bg-green-100 dark:bg-green-900/30' 
                        : 'text-red-600 bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {stat.isPositive ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.prefix}<AnimatedCounter end={stat.value * 10} duration={2000} />{stat.suffix.replace('+', '')}
                    {stat.suffix.includes('+') && '+'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};
