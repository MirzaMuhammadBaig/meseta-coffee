import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import BrewingTicker from "@/components/BrewingTicker";
import Story from "@/components/Story";
import FeaturedItems from "@/components/FeaturedItems";
import BrewingProcess from "@/components/BrewingProcess";
import Eatertainment from "@/components/Eatertainment";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import InstagramTease from "@/components/InstagramTease";
import LocationHours from "@/components/LocationHours";
import CtaBanner from "@/components/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <BrewingTicker />
      <Story />
      <FeaturedItems />
      <BrewingProcess />
      <Eatertainment />
      <ReviewsCarousel />
      <InstagramTease />
      <LocationHours />
      <CtaBanner />
    </>
  );
}
