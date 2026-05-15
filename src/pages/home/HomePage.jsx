import {
  useEffect,
} from "react";

import CustomerIdentityBootstrap from "@/customer/components/CustomerIdentityBootstrap";

import CustomerTierBadge from "@/customer/components/CustomerTierBadge";

import DynamicCampaignBanner from "@/cms/components/DynamicCampaignBanner";

import DynamicCmsRenderer from "@/cms/components/DynamicCmsRenderer";

import DynamicHomeSectionRenderer from "@/cms/components/DynamicHomeSectionRenderer";

import useCmsHomepage from "@/cms/hooks/useCmsHomepage";

import remoteConfigRuntime from "@/cms/runtime/remoteConfigRuntime";

import dynamicHomeLayoutRuntime from "@/cms/runtime/dynamicHomeLayoutRuntime";

function HomePage() {

  const cmsPage =
    useCmsHomepage();

  const sections =
    dynamicHomeLayoutRuntime
      .getSections();

  useEffect(() => {

    remoteConfigRuntime
      .initialize();

  }, []);

  return (

    <div
      className="
        min-h-screen
        bg-black
        p-5
        text-white
      "
    >

      <CustomerIdentityBootstrap />

      <div
        className="
          mb-6
          flex
          items-center
          justify-between
        "
      >

        <div
          className="
            text-4xl
            font-black
          "
        >
          Cing Hu Tang
        </div>

        <CustomerTierBadge />

      </div>

      <div
        className="
          mb-5
        "
      >
        <DynamicCampaignBanner />
      </div>

      <div
        className="
          mb-5
        "
      >

        <DynamicHomeSectionRenderer
          sections={
            sections
          }
        />

      </div>

      <div
        className="
          mb-5
        "
      >

        <DynamicCmsRenderer
          sections={
            cmsPage?.sections ||
            []
          }
        />

      </div>

    </div>

  );

}

export default
  HomePage;