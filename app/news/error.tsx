'use client';

// CamboEA - News Error State

import { Button } from '@/components/ui';

export default function NewsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          អូ! មានបញ្ហាកើតឡើង
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || 'ផ្ទុកមាតិកាព័ត៌មានមិនបាន។ សូមព្យាយាមម្តងទៀត។'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="primary">
            ព្យាយាមម្តងទៀត
          </Button>
          <Button onClick={() => window.location.href = '/news'} variant="outline">
            ត្រលប់ទៅព័ត៌មាន
          </Button>
        </div>
      </div>
    </div>
  );
}
