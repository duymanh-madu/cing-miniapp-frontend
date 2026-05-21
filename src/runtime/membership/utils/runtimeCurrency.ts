export function runtimeCurrency(
  value: number
) {

  return new Intl.NumberFormat(
    "vi-VN"
  ).format(
    value
  );

}