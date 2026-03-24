# CamboEA Improvement Plan

This document captures prioritized improvements for optimization, security, performance, maintainability, readability, and scalability.

## Priority 0: Immediate Fixes

- Lock down `images.remotePatterns` in `next.config.ts` (remove wildcard hosts and allow only trusted domains).
- Add rate limiting and brute-force protection for admin PIN verification in `app/api/admin/verify-pin/route.ts`.
- Add request schema validation for admin APIs:
  - `app/api/admin/news/route.ts`
  - `app/api/admin/news/[id]/route.ts`
  - `app/api/admin/markets/bias/route.ts`
- Fix current lint errors and warnings (especially `no-explicit-any` and React hook setState-in-effect issues).

## Security Improvements

- Add global security headers:
  - `Content-Security-Policy`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
- Review sanitization policy in `lib/sanitize-article-html.ts`:
  - Restrict `data:` URL support for images unless truly required.
- Avoid exposing internal upstream error details from API proxies:
  - `app/api/m/route.ts`
  - `app/api/r/route.ts`
- Align logout cookie behavior with Supabase auth cookie usage in `app/api/admin/logout/route.ts`.

## Performance and Optimization

- Reduce repeated auth and profile lookups in `middleware.ts` for admin routes:
  - Add short-lived cache or move role check into token claims.
- Improve market data polling strategy:
  - Add API response caching and deduplication for `/api/m`.
  - Keep tab visibility optimization already present in `MarketDepthClient`.
- Remove artificial delay in `lib/api/news.ts` (`setTimeout(50)`).
- Address React effect anti-patterns in:
  - `components/features/markets/widgets/TradingViewEmbeds.tsx`
  - `components/layout/Header.tsx`
  - `app/calendar/EconomicCalendarClient.tsx`

## Maintainability and Readability

- Remove duplicated mapping logic for news rows by creating shared mappers/types used by:
  - `app/api/admin/news/route.ts`
  - `app/api/admin/news/[id]/route.ts`
  - `lib/api/news.ts`
- Generate and use typed Supabase DB types to eliminate `any`.
- Split large UI files into smaller, focused units:
  - `components/features/markets/MarketDepthClient.tsx`
  - `components/features/markets/MarketsPageClient.tsx`
- Resolve placeholder/partial implementations:
  - `app/api/contact/route.ts` (currently TODO path)
  - `lib/api/client.ts` (currently empty)

## Scalability Improvements

- Avoid local filesystem persistence for production runtime data:
  - Replace `lib/news-data.ts` JSON file dependency with DB/object storage as source of truth.
- Move outbound notification side effects to async background jobs:
  - Telegram/Facebook publishing from admin routes should use queue + retry strategy.
- Add short TTL caching for frequently read admin/config data where safe.

## Suggested Delivery Roadmap

### Week 1: Security and Correctness

- Image domain allowlist
- PIN rate limiting
- API schema validation baseline
- Lint cleanup and typing fixes

### Week 2: Performance

- Middleware/admin auth query optimization
- Market API caching and request dedupe
- Remove unnecessary runtime delays

### Week 3: Maintainability

- Shared DTOs/mappers for news
- Component decomposition for markets pages
- Remove dead code and placeholders

### Week 4: Scalability

- Queue-based notification pipeline
- Replace local file persistence paths
- Add production observability (errors, latency, retries)

## Success Metrics

- 0 critical security findings in admin and public API routes.
- Lint status reduced to 0 errors and near-0 actionable warnings.
- Faster market page interaction and lower API error rates.
- Reduced code duplication in news/admin data flow.
- Stable behavior across single-instance and serverless multi-instance deployment.
