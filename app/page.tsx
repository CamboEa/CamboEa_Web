import {
  HeroSection,
  FeaturedNews,
  CategorySection,
  StatsSection,
  TestimonialsSection,
  NewsletterSection,
} from '@/components/home';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* <HeroSection /> */}
      <FeaturedNews />
      <CategorySection />
      <StatsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}
