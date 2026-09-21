import { Link } from "react-router-dom";
import HomeHero from "@/components/home/HomeHero";
import AppPopup from "@/components/AppPopup";
import HomeMenuPreview from "@/components/home/HomeMenuPreview";
import HomeQuickActions from "@/features/home/components/HomeQuickActions";
import HomeMembershipCard from "@/features/home/components/HomeMembershipCard";
import HomeWalletSnapshot from "@/features/wallet/components/HomeWalletSnapshot";
import HomeGameTeaser from "@/features/home/components/HomeGameTeaser";
import { PageContainer } from "@/components/ui";

export default function HomePage() {
  return (
    <PageContainer className="pb-24">
      <AppPopup />
      <div className="px-4 pt-4"><HomeHero /></div>
      <div className="px-4 mt-6"><HomeQuickActions /></div>
      <div className="px-4 mt-5"><HomeWalletSnapshot /></div>
      <div className="px-4 mt-5"><HomeMembershipCard /></div>
      <div className="px-4 mt-6"><HomeMenuPreview /></div>
      <div className="px-4 mt-6 mb-4"><HomeGameTeaser /></div>

      <div className="px-4 mt-3 mb-4">
        <Link
          to="/legal"
          aria-label="Thông tin và chính sách của Cing"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 16px",
            borderRadius: 16,
            border: "1px solid #F0D7C6",
            background: "#FFF8F3",
            color: "#8B4828",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <span>Thông tin &amp; chính sách</span>
          <span aria-hidden="true">›</span>
        </Link>
      </div>
    </PageContainer>
  );
}
