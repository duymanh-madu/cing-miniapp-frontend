import {
  useEffect,
} from "react";

import tenantBootstrap from "../tenantBootstrap";

import useTenantStore from "../tenantStore";

import TenantGrid from "../components/TenantGrid";

import DistributedConfigViewer from "../components/DistributedConfigViewer";

function TenantManagementPage() {

  const {

    tenants,

    distributedConfig,

  } = useTenantStore();

  useEffect(() => {

    tenantBootstrap
      .bootstrap();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        Multi-Tenant Platform
      </div>

      <TenantGrid
        tenants={
          tenants
        }
      />

      <DistributedConfigViewer
        distributedConfig={
          distributedConfig
        }
      />

    </div>

  );

}

export default
  TenantManagementPage;