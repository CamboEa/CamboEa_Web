'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSuccess(true);
    setEmail('');
    setIsSubmitting(false);

    // Reset success message after 3 seconds
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-8">
          {/* Icon */}
          <div className="inline-flex p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
            <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Stay Informed, Stay Ahead
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Get the latest forex and crypto news delivered straight to your inbox. Join 50,000+ traders and investors.
          </p>
        </div>

        {/* Newsletter Form */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="bg-white text-blue-600 hover:bg-gray-100 sm:w-auto whitespace-nowrap"
            >
              Subscribe Now
            </Button>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="mt-4 p-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg flex items-center gap-2 animate-fade-in">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-100 font-medium">Successfully subscribed! Check your inbox.</span>
            </div>
          )}

          <p className="mt-4 text-sm text-blue-200 text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>

        {/* Features */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold mb-1">Daily</div>
            <div className="text-sm text-blue-200">Market Updates</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1">Expert</div>
            <div className="text-sm text-blue-200">Analysis & Insights</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1">Breaking</div>
            <div className="text-sm text-blue-200">News Alerts</div>
          </div>
        </div>
      </div>
    </section>
  );
};
