# Forex & Crypto News - Home Page Components

This document provides an overview of all reusable components created for the professional home page.

## 🏗️ Component Architecture

### Layout Components

#### **Header** (`components/layout/Header.tsx`)
A sticky navigation header with responsive design.

**Features:**
- Sticky header with scroll effects
- Responsive mobile menu
- Active route highlighting
- Search functionality placeholder
- Theme toggle placeholder
- CTA button

**Usage:**
```tsx
import { Header } from '@/components/layout/Header';

<Header />
```

#### **Footer** (`components/layout/Footer.tsx`)
Comprehensive footer with links and social media.

**Features:**
- Multi-column link organization
- Social media icons
- Brand information
- Responsive grid layout
- Legal links

**Usage:**
```tsx
import { Footer } from '@/components/layout/Footer';

<Footer />
```

---

### Home Page Sections

#### **HeroSection** (`components/home/HeroSection.tsx`)
Eye-catching hero section with gradient background.

**Features:**
- Gradient background with pattern overlay
- Live market updates badge
- Call-to-action buttons
- Statistics display
- Feature cards with icons
- Fully responsive

**Props:** None (static content)

#### **MarketTicker** (`components/home/MarketTicker.tsx`)
Auto-scrolling market data ticker.

**Features:**
- Infinite scroll animation
- Real-time price updates simulation
- Pause on hover
- Color-coded price changes
- Multiple market pairs (Forex & Crypto)

**Props:** None (uses internal state)

#### **FeaturedNews** (`components/home/FeaturedNews.tsx`)
Grid display of featured news articles.

**Features:**
- Responsive grid layout (4 columns on desktop)
- First article featured with larger size
- Category badges
- Read time and date
- Hover effects
- Image placeholders

**Data Structure:**
```tsx
interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
}
```

#### **CategorySection** (`components/home/CategorySection.tsx`)
Category navigation cards.

**Features:**
- 4-column responsive grid
- Gradient icon backgrounds
- Article counts
- Hover animations
- Custom icons for each category

**Categories:**
- Forex Trading
- Cryptocurrency
- Market Analysis
- Global Markets

#### **StatsSection** (`components/home/StatsSection.tsx`)
Key platform statistics display.

**Features:**
- 4 stat cards
- Icon indicators
- Percentage change indicators
- Responsive grid

**Stats Displayed:**
- Total Market Cap
- 24h Trading Volume
- Active Traders
- Markets Tracked

#### **TestimonialsSection** (`components/home/TestimonialsSection.tsx`)
User testimonials showcase.

**Features:**
- 3-column grid
- Star ratings
- User avatars (initials)
- Professional styling
- Hover effects

#### **NewsletterSection** (`components/home/NewsletterSection.tsx`)
Newsletter subscription form.

**Features:**
- Email input with validation
- Loading states
- Success message
- Gradient background
- Feature highlights
- Form submission handling

---

### UI Components

#### **Button** (`components/ui/Button.tsx`)
Flexible button component with multiple variants.

**Props:**
```tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
```

**Variants:**
- `primary` - Blue background (default)
- `secondary` - Gray background
- `outline` - Transparent with border
- `ghost` - Transparent, hover background
- `danger` - Red background

**Usage:**
```tsx
<Button variant="primary" size="lg" isLoading={false}>
  Click Me
</Button>
```

#### **Card** (`components/ui/Card.tsx`)
Container component with multiple style variants.

**Components:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardContent` - Content area

**Variants:**
- `default` - Simple background
- `bordered` - With border
- `elevated` - With shadow
- `glass` - Glassmorphism effect

**Usage:**
```tsx
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

---

## 🎨 Design Features

### Color Scheme
- **Primary:** Blue (#2563eb)
- **Secondary:** Purple (#9333ea)
- **Success:** Green (#16a34a)
- **Danger:** Red (#dc2626)
- **Warning:** Orange (#ea580c)

### Typography
- **Headings:** Geist Sans (font-bold)
- **Body:** Geist Sans (font-normal)
- **Code:** Geist Mono

### Spacing
- Sections: `py-16` (4rem padding)
- Max Width: `max-w-7xl` (80rem)
- Grid Gaps: `gap-6` to `gap-8`

### Responsive Breakpoints
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px

---

## 🚀 Usage Example

```tsx
// app/page.tsx
import {
  HeroSection,
  MarketTicker,
  FeaturedNews,
  CategorySection,
  StatsSection,
  TestimonialsSection,
  NewsletterSection,
} from '@/components/home';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <MarketTicker />
      <FeaturedNews />
      <CategorySection />
      <StatsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}
```

---

## 🔧 Customization

### Adding New Sections
1. Create component in `components/home/`
2. Export from `components/home/index.ts`
3. Import and use in `app/page.tsx`

### Modifying Styles
- All components use Tailwind CSS
- Dark mode supported via `dark:` variants
- Modify utility classes directly in components

### Data Integration
Currently using static data. To integrate with API:

1. Create API route in `app/api/`
2. Use `useNews`, `useForex`, or `useCrypto` hooks
3. Pass data as props to components
4. Update component interfaces

---

## 📦 Dependencies

```json
{
  "next": "16.1.4",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "tailwindcss": "^4",
  "clsx": "latest",
  "tailwind-merge": "latest"
}
```

---

## 🎯 Best Practices

1. **Component Reusability:** All components are self-contained and reusable
2. **TypeScript:** Full type safety with interfaces
3. **Accessibility:** ARIA labels and semantic HTML
4. **Performance:** Client components only where needed
5. **Responsive:** Mobile-first design approach
6. **Dark Mode:** Full dark mode support

---

## 📝 Notes

- All components support dark mode
- Animations are performance-optimized
- Components are tree-shakeable
- SEO-friendly with proper metadata
- Fully typed with TypeScript

---

Built with ❤️ using Next.js 16, React 19, and Tailwind CSS 4
