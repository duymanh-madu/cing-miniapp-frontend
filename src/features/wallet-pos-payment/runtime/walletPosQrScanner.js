const CAPABILITY_PREFIX =
  "CING_WALLET_PAY_V1.";


function createScannerError(
  message,
  code,
  cause
) {
  const error =
    new Error(message);

  error.code =
    code;

  if (cause) {
    error.cause =
      cause;
  }

  return error;
}


export function
normalizeCingWalletQrContent(
  value
) {
  const content =
    String(
      value || ""
    ).trim();

  if (
    !content ||
    !content.startsWith(
      CAPABILITY_PREFIX
    )
  ) {
    throw createScannerError(
      "QR này không phải mã thanh toán Cing Wallet.",
      "CING_WALLET_POS_QR_INVALID"
    );
  }

  return content;
}


export async function
scanCingWalletPosQr() {
  try {
    const {
      scanQRCode,
    } =
      await import(
        "zmp-sdk/apis"
      );

    if (
      typeof scanQRCode !==
      "function"
    ) {
      throw createScannerError(
        "Thiết bị hiện tại chưa hỗ trợ quét QR trong Zalo.",
        "CING_WALLET_POS_SCANNER_UNAVAILABLE"
      );
    }

    const result =
      await scanQRCode();

    return normalizeCingWalletQrContent(
      result?.content
    );
  } catch (error) {
    if (
      error?.code &&
      String(
        error.code
      ).startsWith(
        "CING_WALLET_"
      )
    ) {
      throw error;
    }

    throw createScannerError(
      "Không thể quét QR. Vui lòng thử lại.",
      "CING_WALLET_POS_SCAN_FAILED",
      error
    );
  }
}


export {
  CAPABILITY_PREFIX,
};
