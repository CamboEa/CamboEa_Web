'use client';

// Animated Section Component with Intersection Observer

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

type AnimationType = 
  | 'fade-in'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'scale-in'
  | 'bounce-in'
  | 'slide-in-bottom'
  | 'slide-in-right';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export const AnimatedSection = ({
  children,
  animation = 'fade-in-up',
  delay = 0,
  duration = 600,
  className,
  threshold = 0.1,
  once = true,
}: AnimatedSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refEl = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && refEl) {
            observer.unobserve(refEl);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (refEl) {
      observer.observe(refEl);
    }

    return () => {
      if (refEl) {
        observer.unobserve(refEl);
      }
    };
  }, [threshold, once]);

  const animationClass = `animate-${animation}`;

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className={isVisible ? animationClass : ''}
        style={{
          animationDelay: `${delay}ms`,
          animationDuration: `${duration}ms`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Staggered children animation wrapper
interface StaggeredListProps {
  children: React.ReactNode[];
  animation?: AnimationType;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList = ({
  children,
  animation = 'fade-in-up',
  staggerDelay = 100,
  className,
}: StaggeredListProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refEl = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (refEl) {
            observer.unobserve(refEl);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (refEl) {
      observer.observe(refEl);
    }

    return () => {
      if (refEl) {
        observer.unobserve(refEl);
      }
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            animationDelay: `${index * staggerDelay}ms`,
          }}
          className={isVisible ? `animate-${animation}` : ''}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Counter animation component
interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  className,
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const refEl = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (refEl) {
      observer.observe(refEl);
    }

    return () => {
      if (refEl) {
        observer.unobserve(refEl);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Typing animation component
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const Typewriter = ({
  text,
  speed = 50,
  className,
  onComplete,
}: TypewriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const refEl = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (refEl) {
      observer.observe(refEl);
    }

    return () => {
      if (refEl) {
        observer.unobserve(refEl);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, index + 1));
      index++;
      if (index === text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isVisible, text, speed, onComplete]);

  return (
    <span ref={ref} className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};