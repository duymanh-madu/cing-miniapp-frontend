import HomeHero from "@/components/home/HomeHero";
import HomeMenuPreview from "@/components/home/HomeMenuPreview";
import HomeQuickActions from "@/features/home/components/HomeQuickActions";
import HomeMembershipCard from "@/features/home/components/HomeMembershipCard";
import HomeGameTeaser from "@/features/home/components/HomeGameTeaser";
import { PageContainer } from "@/components/ui";

export default function HomePage() {
  return (
    <PageContainer className="pb-24">
      <div className="px-4 pt-4"><HomeHero /></div>
      <div className="px-4 mt-6"><HomeQuickActions /></div>
      <div className="mt-6"></div>
      <div className="px-4 mt-6"><HomeMembershipCard /></div>
      <div className="px-4 mt-6"><HomeMenuPreview /></div>
      <div className="px-4 mt-6 mb-4"><HomeGameTeaser /></div>
    </PageContainer>
  );
}
