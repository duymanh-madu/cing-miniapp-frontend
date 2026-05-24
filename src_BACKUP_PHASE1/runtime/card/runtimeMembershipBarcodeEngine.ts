export function buildMembershipBarcode(
  phone: string,
) {

  const safePhone =
    phone.replace(
      /\D/g,
      "",
    );

  return {

    value:
      safePhone,

    displayValue:
      safePhone,

    format:
      "CODE128",

    lineWidth:
      2.4,

    height:
      82,

    margin:
      16,

    background:
      "#ffffff",

    foreground:
      "#000000",

  };

}