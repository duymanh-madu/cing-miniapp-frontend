export interface RuntimeCrmCustomer {

  customerId:
    string;

  phone:
    string;

  fullName:
    string;

  memberTier:
    string;

  partnerTier:
    string | null;

  totalSpent:
    number;

  loyaltyPoints:
    number;

  monthlySpent:
    number;

  oaFollowed:
    boolean;

  activated:
    boolean;

}