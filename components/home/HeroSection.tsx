'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { AnimatedCounter } from '@/components/ui/AnimatedSection';

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-animated text-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse-soft"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}></div>

        {/* Floating Particles */}
        <div className="particles-bg absolute inset-0"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8">
            {/* Live Badge */}
            <div className="animate-fade-in-down inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/20 hover-scale cursor-pointer">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium">ព័ត៌មានទីផ្សារផ្ទាល់</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="animate-fade-in-up block">ច្រកចូលរបស់អ្នកទៅ</span>
              <span className="animate-fade-in-up delay-200 block mt-2 gradient-text-gold">
                CamboEA
              </span>
              <span className="animate-fade-in-up delay-400 block mt-2">ឆ្លាតវៃ</span>
            </h1>

            {/* Description */}
            <p className="animate-fade-in-up delay-500 text-lg sm:text-xl text-blue-100 max-w-xl">
              ព័ត៌មានពិភពលោកដែលអាចផ្តល់ឥទ្ធិពលដល់គូប្រាក់ មាស និងគ្រីបធ័។ នៅចម្ងាយមុខជាមួយព្រឹត្តិការណ៍សកល និងការវិភាគអ្នកជំនាញ។
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up delay-600 flex flex-col sm:flex-row gap-4">
              <Link href="/news">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-900 hover:bg-gray-100 hover-scale group">
                  រុករកព័ត៌មាន
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/analysis">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 hover-scale animate-glow">
                  សញ្ញាធ្វើដូច
                </Button>
              </Link>
            </div>

            {/* Animated Stats */}
            <div className="animate-fade-in-up delay-700 grid grid-cols-3 gap-6 pt-8">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold">
                  <AnimatedCounter end={500} suffix="+" />
                </div>
                <div className="text-sm text-blue-200">ព័ត៌មានប្រចាំថ្ងៃ</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold">
                  <AnimatedCounter end={50} suffix="K+" />
                </div>
                <div className="text-sm text-blue-200">អ្នកអានសកម្ម</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-blue-200">ការគ្រប</div>
              </div>
            </div>
          </div>

          {/* Right Content - Animated Feature Cards */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            {/* Main Card */}
            <div className="animate-fade-in-right delay-300 col-span-2 glass rounded-2xl p-6 border border-white/20 hover-lift cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:animate-glow-green transition-all">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">អត្រាប្តូរប្រាក់ផ្ទាល់</h3>
              </div>
              <p className="text-sm text-blue-100">អត្រាប្តូរប្រាក់ និងការវិភាគផ្ទាល់</p>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="price-up font-semibold">EUR/USD 1.0875</span>
                <span className="price-down font-semibold">GBP/USD 1.2654</span>
              </div>
            </div>

            {/* Crypto Card */}
            <div className="animate-fade-in-right delay-500 glass rounded-2xl p-6 border border-white/20 hover-lift cursor-pointer group">
              <div className="p-2 bg-orange-500/20 rounded-lg w-fit mb-3 group-hover:animate-glow-orange transition-all">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">ទីផ្សារគ្រីបធ័</h3>
              <p className="text-xs text-blue-100">តាមដានគ្រីបធ័ឈានមុច</p>
              <div className="mt-3">
                <span className="price-up text-sm font-semibold">BTC $52,345</span>
              </div>
            </div>

            {/* Analysis Card */}
            <div className="animate-fade-in-right delay-700 glass rounded-2xl p-6 border border-white/20 hover-lift cursor-pointer group">
              <div className="p-2 bg-blue-500/20 rounded-lg w-fit mb-3 group-hover:animate-glow transition-all">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">ការវិភាគអ្នកជំនាញ</h3>
              <p className="text-xs text-blue-100">ការយល់ដឹងទីផ្សារជ្រៅ</p>
              <div className="mt-3">
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">ភាពត្រឹមត្រូវ ៧៥%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};
