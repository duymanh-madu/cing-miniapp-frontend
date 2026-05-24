class CrmIposSyncEngine {

  async sync(iposData: any, local: any) {

    return {
      phone: iposData.phone,
      name: iposData.name,
      spend: Math.max(iposData.spend || 0, local.spend || 0),
      tier: iposData.tier || local.tier,
      syncedAt: Date.now(),
      source: "IPOS_PRIORITY",
    };

  }

}

export const crmIposSyncEngine = new CrmIposSyncEngine();
