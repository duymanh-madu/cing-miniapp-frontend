export type RuntimeMembershipTier =
  | "hoi_vien"
  | "hoi_vien_than_thiet"
  | "hoi_vien_bac"
  | "hoi_vien_vang"
  | "hoi_vien_kim_cuong"
  | "doi_tac"
  | "doi_tac_than_thiet";

export interface RuntimeCustomerIdentity {

  customerId:
    string;

  zaloUserId?:
    string;

  phone?:
    string;

  fullName?:
    string;

  avatar?:
    string;

  oaFollowed:
    boolean;

  phoneGranted:
    boolean;

  memberActivated:
    boolean;

  tier:
    RuntimeMembershipTier;

  loyaltyPoints:
    number;

  cumulativeSpending:
    number;

}