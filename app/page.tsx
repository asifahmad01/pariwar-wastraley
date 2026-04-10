import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ContactSection from "@/components/sections/ContactSection";
import ShopExperience from "@/components/ShopExperience";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ShopExperience />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
