import jsQR from "jsqr";


const CAPABILITY_PREFIX =
  "CING_WALLET_PAY_V1.";

const CAMERA_START_TIMEOUT_MS =
  10000;

const SCAN_TIMEOUT_MS =
  30000;

const SCAN_INTERVAL_MS =
  250;

const FRAME_WIDTH =
  640;

const FRAME_HEIGHT =
  480;


function createScannerError(
  message,
  code,
  cause
) {
  const error =
    new Error(
      message
    );

  error.code =
    code;

  if (
    cause
  ) {
    error.cause =
      cause;
  }

  return error;
}


function withTimeout(
  promise,
  {
    timeoutMs,
    code,
    message,
  }
) {
  let timer;

  const timeoutPromise =
    new Promise(
      (
        _,
        reject
      ) => {
        timer =
          setTimeout(
            () => {
              reject(
                createScannerError(
                  message,
                  code
                )
              );
            },
            timeoutMs
          );
      }
    );

  return Promise.race([
    promise,
    timeoutPromise,
  ]).finally(
    () => {
      if (
        timer
      ) {
        clearTimeout(
          timer
        );
      }
    }
  );
}


function wait(
  ms
) {
  return new Promise(
    resolve => {
      setTimeout(
        resolve,
        ms
      );
    }
  );
}


export function
normalizeCingWalletQrContent(
  value
) {
  const content =
    String(
      value ||
      ""
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


function createFrameReader(
  videoElement
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    FRAME_WIDTH;

  canvas.height =
    FRAME_HEIGHT;

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      }
    );

  if (
    !context
  ) {
    throw createScannerError(
      "Không thể khởi tạo bộ đọc hình ảnh QR.",
      "CING_WALLET_POS_FRAME_CONTEXT_UNAVAILABLE"
    );
  }

  return () => {
    if (
      !videoElement ||
      videoElement.readyState <
        2 ||
      videoElement.videoWidth <=
        0 ||
      videoElement.videoHeight <=
        0
    ) {
      return null;
    }

    context.drawImage(
      videoElement,
      0,
      0,
      FRAME_WIDTH,
      FRAME_HEIGHT
    );

    return context.getImageData(
      0,
      0,
      FRAME_WIDTH,
      FRAME_HEIGHT
    );
  };
}


async function waitForVideoReady(
  videoElement
) {
  const startedAt =
    Date.now();

  while (
    Date.now() -
      startedAt <
    CAMERA_START_TIMEOUT_MS
  ) {
    if (
      videoElement?.readyState >=
        2 &&
      videoElement?.videoWidth >
        0 &&
      videoElement?.videoHeight >
        0
    ) {
      return;
    }

    await wait(
      50
    );
  }

  throw createScannerError(
    "Camera đã mở nhưng chưa cung cấp hình ảnh.",
    "CING_WALLET_POS_CAMERA_STREAM_TIMEOUT"
  );
}


export async function
scanCingWalletPosQr(
  {
    videoElement,
  } = {}
) {
  if (
    !videoElement
  ) {
    throw createScannerError(
      "Không tìm thấy vùng hiển thị camera.",
      "CING_WALLET_POS_CAMERA_ELEMENT_MISSING"
    );
  }

  let camera =
    null;

  try {
    const {
      createCameraContext,
    } =
      await import(
        "zmp-sdk/apis"
      );

    if (
      typeof createCameraContext !==
      "function"
    ) {
      throw createScannerError(
        "Thiết bị hiện tại chưa hỗ trợ camera Mini App.",
        "CING_WALLET_POS_CAMERA_UNAVAILABLE"
      );
    }

    camera =
      createCameraContext({
        videoElement,
        mediaConstraints: {
          width:
            FRAME_WIDTH,
          height:
            FRAME_HEIGHT,
          facingMode:
            "environment",
          audio:
            false,
          video:
            true,
          mirrored:
            false,
        },
      });

    await withTimeout(
      camera.start(),
      {
        timeoutMs:
          CAMERA_START_TIMEOUT_MS,
        code:
          "CING_WALLET_POS_CAMERA_START_TIMEOUT",
        message:
          "Camera không phản hồi khi khởi động.",
      }
    );

    await waitForVideoReady(
      videoElement
    );

    const readFrame =
      createFrameReader(
        videoElement
      );

    const scanStartedAt =
      Date.now();

    while (
      Date.now() -
        scanStartedAt <
      SCAN_TIMEOUT_MS
    ) {
      const frame =
        readFrame();

      if (
        frame
      ) {
        const decoded =
          jsQR(
            frame.data,
            frame.width,
            frame.height,
            {
              inversionAttempts:
                "dontInvert",
            }
          );

        if (
          decoded?.data
        ) {
          return normalizeCingWalletQrContent(
            decoded.data
          );
        }
      }

      await wait(
        SCAN_INTERVAL_MS
      );
    }

    throw createScannerError(
      "Không tìm thấy mã QR Cing Wallet.",
      "CING_WALLET_POS_SCAN_TIMEOUT"
    );
  } catch (
    error
  ) {
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

    const name =
      String(
        error?.name ||
        ""
      );

    if (
      name ===
        "NotAllowedError" ||
      name ===
        "PermissionDeniedError"
    ) {
      throw createScannerError(
        "Zalo chưa được phép sử dụng camera trên thiết bị.",
        "CING_WALLET_POS_CAMERA_PERMISSION_DENIED",
        error
      );
    }

    if (
      name ===
        "NotFoundError" ||
      name ===
        "DevicesNotFoundError"
    ) {
      throw createScannerError(
        "Không tìm thấy camera trên thiết bị.",
        "CING_WALLET_POS_CAMERA_NOT_FOUND",
        error
      );
    }

    if (
      name ===
        "OverconstrainedError"
    ) {
      throw createScannerError(
        "Camera thiết bị không hỗ trợ cấu hình quét hiện tại.",
        "CING_WALLET_POS_CAMERA_CONSTRAINT_FAILED",
        error
      );
    }

    throw createScannerError(
      "Không thể khởi động camera quét QR.",
      "CING_WALLET_POS_CAMERA_FAILED",
      error
    );
  } finally {
    try {
      camera?.stop?.();
    } catch {
      void 0;
    }

    if (
      videoElement
    ) {
      try {
        videoElement.pause();
      } catch {
        void 0;
      }

      videoElement.srcObject =
        null;
    }
  }
}



const GALLERY_MAX_FILE_BYTES =
  20 * 1024 * 1024;

const GALLERY_MAX_DIMENSION =
  2048;


export async function
scanCingWalletPosQrImage(
  file
) {
  if (
    !file ||
    (
      file.type &&
      !file.type.startsWith(
        "image/"
      )
    )
  ) {
    throw createScannerError(
      "Vui lòng chọn một tệp hình ảnh.",
      "CING_WALLET_POS_IMAGE_INVALID"
    );
  }

  if (
    file.size >
    GALLERY_MAX_FILE_BYTES
  ) {
    throw createScannerError(
      "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 20 MB.",
      "CING_WALLET_POS_IMAGE_TOO_LARGE"
    );
  }

  const imageUrl =
    URL.createObjectURL(
      file
    );

  try {
    const image =
      new Image();

    await new Promise(
      (
        resolve,
        reject
      ) => {
        image.onload =
          resolve;

        image.onerror =
          () => {
            reject(
              createScannerError(
                "Không thể đọc ảnh đã chọn.",
                "CING_WALLET_POS_IMAGE_READ_FAILED"
              )
            );
          };

        image.src =
          imageUrl;
      }
    );

    const originalWidth =
      image.naturalWidth;

    const originalHeight =
      image.naturalHeight;

    if (
      !originalWidth ||
      !originalHeight
    ) {
      throw createScannerError(
        "Ảnh không hợp lệ.",
        "CING_WALLET_POS_IMAGE_INVALID"
      );
    }

    const scale =
      Math.min(
        1,
        GALLERY_MAX_DIMENSION /
          Math.max(
            originalWidth,
            originalHeight
          )
      );

    const width =
      Math.max(
        1,
        Math.round(
          originalWidth *
            scale
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          originalHeight *
            scale
        )
      );

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      width;

    canvas.height =
      height;

    const context =
      canvas.getContext(
        "2d",
        {
          willReadFrequently:
            true,
        }
      );

    if (!context) {
      throw createScannerError(
        "Không thể xử lý ảnh QR.",
        "CING_WALLET_POS_IMAGE_CONTEXT_FAILED"
      );
    }

    context.drawImage(
      image,
      0,
      0,
      width,
      height
    );

    const pixels =
      context.getImageData(
        0,
        0,
        width,
        height
      );

    const decoded =
      jsQR(
        pixels.data,
        pixels.width,
        pixels.height,
        {
          inversionAttempts:
            "attemptBoth",
        }
      );

    if (
      !decoded?.data
    ) {
      throw createScannerError(
        "Không tìm thấy mã QR trong ảnh. Vui lòng chọn ảnh rõ nét hơn.",
        "CING_WALLET_POS_IMAGE_QR_NOT_FOUND"
      );
    }

    return normalizeCingWalletQrContent(
      decoded.data
    );
  } finally {
    URL.revokeObjectURL(
      imageUrl
    );
  }
}


export {
  CAPABILITY_PREFIX,
};
