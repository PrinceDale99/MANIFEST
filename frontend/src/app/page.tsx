'use client'

import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import CTASection from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
