import HeroSection from "@/components/landing/HeroSection"
import CosmosEngine from "@/components/background/LuminaBackground"

export default function Home() {

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020408]">

      {/* Animated Cosmos Background */}
      <CosmosEngine />

      {/* Hero */}
      <HeroSection />

    </main>
  )

}