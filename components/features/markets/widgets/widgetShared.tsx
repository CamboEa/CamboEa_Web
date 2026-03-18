'use client';

import React, { useEffect, useRef, useState } from 'react';

export const WidgetSkeleton = ({ height }: { height: number }) => (
  <div
    className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-center">
      <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុកជារៀប...</p>
    </div>
  </div>
);

export const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
};

export const widgetCache = new Map<string, boolean>();
