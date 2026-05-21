export type RuntimeMembershipTier =
  | "hoi_vien"
  | "hoi_vien_than_thiet"
  | "hoi_vien_bac"
  | "hoi_vien_vang"
  | "hoi_vien_kim_cuong";

export type RuntimePartnerTier =
  | "doi_tac"
  | "doi_tac_than_thiet";

export interface RuntimeMembershipCardData {

  customerId: string;

  fullName: string;

  phone: string;

  avatar?: string;

  memberTier?: RuntimeMembershipTier;

  partnerTier?: RuntimePartnerTier | null;

  loyaltyPoints: number;

  totalSpent: number;

  nextTierTarget?: number;

  monthlySpent?: number;

  realtimeConnected: boolean;

}