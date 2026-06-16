import { FeaturesSection } from '#/components/landing/features-section'
import { FinalCtaSection } from '#/components/landing/final-cta-section'
import { HeroSection } from '#/components/landing/hero-section'
import { HowItWorksSection } from '#/components/landing/how-it-works-section'
import { LandingFooter } from '#/components/landing/landing-footer'
import { LandingNavbar } from '#/components/landing/landing-navbar'
import { LogoMarquee } from '#/components/landing/logo-marquee'
import { PricingTeaser } from '#/components/landing/pricing-teaser'
import { StatsSection } from '#/components/landing/stats-section'
import { TemplatesSection } from '#/components/landing/templates-section'
import { TestimonialSection } from '#/components/landing/testimonial-section'

export function LandingPage() {
  return (
    <div className="landing-page min-h-screen">
      <LandingNavbar />
      <main>
        <HeroSection />
        <LogoMarquee />
        <FeaturesSection />
        <HowItWorksSection />
        <TemplatesSection />
        <StatsSection />
        <TestimonialSection />
        <PricingTeaser />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
