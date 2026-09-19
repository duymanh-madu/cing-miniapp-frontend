import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const runtime =
  fs.readFileSync(
    "src/features/wallet-pos-payment/runtime/walletPosQrScanner.js",
    "utf8"
  );

const page =
  fs.readFileSync(
    "src/features/wallet-pos-payment/pages/WalletPosPaymentPage.jsx",
    "utf8"
  );

test(
  "gallery decoder reuses jsQR and canonical validator",
  () => {
    assert.match(
      runtime,
      /scanCingWalletPosQrImage/
    );

    assert.match(
      runtime,
      /jsQR\(\s*pixels\.data/
    );

    assert.match(
      runtime,
      /return normalizeCingWalletQrContent\(\s*decoded\.data\s*\)/
    );
  }
);

test(
  "selected image stays local to the device",
  () => {
    const start =
      runtime.indexOf(
        "export async function\nscanCingWalletPosQrImage"
      );

    const end =
      runtime.indexOf(
        "\nexport {\n  CAPABILITY_PREFIX,",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const gallery =
      runtime.slice(
        start,
        end
      );

    assert.doesNotMatch(
      gallery,
      /fetch\(|apiClient|FormData|XMLHttpRequest/
    );

    assert.match(
      gallery,
      /URL\.createObjectURL/
    );

    assert.match(
      gallery,
      /URL\.revokeObjectURL/
    );
  }
);

test(
  "gallery and camera both enter existing preview authority",
  () => {
    assert.match(
      page,
      /scanCingWalletPosQrImage\(\s*file\s*\)/
    );

    const previewCalls =
      page.match(
        /await loadPreview\(\s*scanned\s*\)/g
      ) || [];

    assert.equal(
      previewCalls.length,
      2
    );
  }
);

test(
  "gallery requires explicit customer selection",
  () => {
    assert.match(
      page,
      /type="file"/
    );

    assert.match(
      page,
      /accept="image\/\*"/
    );

    assert.match(
      page,
      /onChange=\{\s*handleGallerySelection\s*\}/
    );

    assert.match(
      page,
      /Chọn ảnh QR từ thư viện/
    );
  }
);

test(
  "existing camera and payment confirmation remain present",
  () => {
    assert.match(
      page,
      /scanCingWalletPosQr\(\{/
    );

    assert.match(
      page,
      /videoElement:\s*cameraVideoRef\.current/
    );

    assert.match(
      page,
      /confirmWalletPosPayment\(\s*capability\s*\)/
    );

    assert.match(
      page,
      /Quét QR thanh toán/
    );
  }
);
