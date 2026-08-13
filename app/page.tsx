import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { OrderSection } from "@/components/OrderSection";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <OrderSection />
      </main>
    </>
  );
}
