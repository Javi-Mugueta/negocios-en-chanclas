import { Hero } from "@/components/home/hero";
import { StatesMarquee } from "@/components/home/states-marquee";
import { Path } from "@/components/home/path";
import { Entities } from "@/components/home/entities";
import { Packages } from "@/components/home/packages";
import { Honesty } from "@/components/home/honesty";
import { Support } from "@/components/home/support";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <StatesMarquee />
      <Path />
      <Entities />
      <Packages />
      <Honesty />
      <Support />
      <FaqSection />
      <div className="pt-24 md:pt-32">
        <FinalCta />
      </div>
    </>
  );
}
