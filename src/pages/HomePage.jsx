import HomeHero from "@/components/home/HomeHero";

import HomeMenuPreview from "@/components/home/HomeMenuPreview";

function HomePage() {

  return (
    <div
      className="
        px-4
        pb-24
      "
    >
      <HomeHero />

      <HomeMenuPreview />
    </div>
  );

}

export default
  HomePage;