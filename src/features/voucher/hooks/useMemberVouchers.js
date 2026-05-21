import {
  useMemberVouchersQuery,
} from "@/infra/api/voucher/voucherQueries";

export function useMemberVouchers(
  userId
) {
  const query =
    useMemberVouchersQuery(
      userId
    );

  return {
    vouchers:
      query.data || [],

    isLoading:
      query.isLoading,

    error:
      query.error,
  };
}