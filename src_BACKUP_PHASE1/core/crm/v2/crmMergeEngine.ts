class CrmMergeEngine {

  merge(local: any, ipos: any) {

    return {
      phone: local.phone || ipos.phone,
      name: ipos.name || local.name,
      totalSpend: Math.max(local.totalSpend || 0, ipos.totalSpend || 0),
      tier: ipos.tier || local.tier,
      updatedAt: Date.now(),
      source: "IPOS_PRIORITY",
    };

  }

}

export const crmMergeEngine = new CrmMergeEngine();
