'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setEmail('');
    setIsSubmitting(false);
    toast.success('ជាវជោគជ័យ! សូមពិនិត្យអ៉ីមែលរបស់អ្នក។');
  };

  return (
    <section className="py-16 bg-linear-to-br from-sky-500 via-blue-600 to-blue-800 text-white relative overflow-hidden">
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
            នៅដែលដឹង នៅមុខ
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            ទទួលព័ត៌មានពិភពលោកដែលផ្តល់ឥទ្ធិពលដល់គូប្រាក់ មាស និងគ្រីបធ័ផ្ទាល់ទៅអ៉ីមែលរបស់អ្នក។ ចូលរួមជាមួយអ្នកធ្វើដូច និងវិនិយោគិន ៥០,០០០+ នាក់។
          </p>
        </div>

        {/* Newsletter Form */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="បញ្ចូលអ៉ីមែលរបស់អ្នក"
              required
              className="flex-1 px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="bg-white text-blue-600 hover:bg-gray-100 sm:w-auto whitespace-nowrap"
            >
              ជាវឥឡូវ
            </Button>
          </div>

          <p className="mt-4 text-sm text-blue-200 text-center">
            យើងគោរពភាពឯកជនរបស់អ្នក។ លែងជាវគ្រប់ពេលបាន។
          </p>
        </form>

        {/* Features */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold mb-1">ប្រចាំថ្ងៃ</div>
            <div className="text-sm text-blue-200">ព័ត៌មានពិភពលោក</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1">អ្នកជំនាញ</div>
            <div className="text-sm text-blue-200">ការវិភាគ និងការយល់ដឹង</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1">ព័ត៌មាន</div>
            <div className="text-sm text-blue-200">ការជូនដំណឹង</div>
          </div>
        </div>
      </div>
    </section>
  );
};
