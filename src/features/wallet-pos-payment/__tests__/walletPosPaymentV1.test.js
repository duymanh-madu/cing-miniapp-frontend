import test
  from "node:test";

import assert
  from "node:assert/strict";

import fs
  from "node:fs";


const scannerSource =
  fs.readFileSync(
    "src/features/wallet-pos-payment/runtime/walletPosQrScanner.js",
    "utf8"
  );

const apiSource =
  fs.readFileSync(
    "src/features/wallet-pos-payment/api/walletPosPaymentApi.js",
    "utf8"
  );

const pageSource =
  fs.readFileSync(
    "src/features/wallet-pos-payment/pages/WalletPosPaymentPage.jsx",
    "utf8"
  );

const manifestSource =
  fs.readFileSync(
    "src/app/routeManifest.js",
    "utf8"
  );

const walletServicesSource =
  fs.readFileSync(
    "src/features/wallet/components/WalletQuickServices.jsx",
    "utf8"
  );

const walletPageSource =
  fs.readFileSync(
    "src/features/wallet/pages/WalletPage.jsx",
    "utf8"
  );

const layoutSource =
  fs.readFileSync(
    "src/layouts/AppLayout.jsx",
    "utf8"
  );


test(
  "scanner accepts only Cing Wallet signed capability prefix",
  () => {
    assert.match(
      scannerSource,
      /CING_WALLET_PAY_V1\./
    );

    assert.match(
      scannerSource,
      /startsWith\(\s*CAPABILITY_PREFIX\s*\)/
    );
  }
);


test(
  "preview sends capability only in route and never sends amount or user id",
  () => {
    assert.match(
      apiSource,
      /apiClient\.get\([\s\S]*\/wallet\/pos-pay\//
    );

    assert.doesNotMatch(
      apiSource,
      /\bamount\s*:|\buser_id\s*:|\buserId\s*:/
    );
  }
);


test(
  "confirm sends no caller financial payload",
  () => {
    assert.match(
      apiSource,
      /apiClient\.post\([\s\S]*\/confirm/
    );

    assert.doesNotMatch(
      apiSource,
      /apiClient\.post\([\s\S]*?\{\s*(?:amount|user_id|userId)\s*:/
    );
  }
);


test(
  "success UI requires backend paid status",
  () => {
    assert.match(
      pageSource,
      /data\?\.status\s*!==\s*"paid"/
    );

    assert.match(
      pageSource,
      /setResult\(\s*data\s*\)/
    );
  }
);


test(
  "insufficient balance never renders payment confirm button",
  () => {
    assert.match(
      pageSource,
      /!sufficient\s*\?/
    );

    assert.match(
      pageSource,
      /Số dư không đủ/
    );

    assert.match(
      pageSource,
      /Nạp thêm vào Cing Wallet/
    );
  }
);


test(
  "double confirm is fenced in frontend presentation layer",
  () => {
    assert.match(
      pageSource,
      /confirmInFlight\.current/
    );

    assert.match(
      pageSource,
      /setConfirming\(true\)/
    );
  }
);


test(
  "wallet POS payment route requires authentication",
  () => {
    assert.match(
      manifestSource,
      /key:"wallet-pos-payment"[\s\S]*requireAuth:true/
    );
  }
);


test(
  "premium Wallet exposes POS QR scan entry",
  () => {
    assert.match(
      walletServicesSource,
      /Quét QR/
    );

    assert.match(
      walletServicesSource,
      /navigate\([\s\S]*"\/wallet\/pos-pay"/
    );

    assert.match(
      walletPageSource,
      /"\/wallet\/pos-pay"/
    );
  }
);


test(
  "POS payment route suppresses floating cart and bottom navigation",
  () => {
    assert.match(
      layoutSource,
      /startsWith\("\/wallet\/pos-pay"\)/
    );
  }
);


test(
  "frontend never decides or mutates Wallet financial balance locally",
  () => {
    assert.doesNotMatch(
      pageSource,
      /apiClient\.(post|put|patch)\([\s\S]*wallet.*balance/
    );

    assert.doesNotMatch(
      pageSource,
      /localStorage.*wallet.*balance|sessionStorage.*wallet.*balance/i
    );
  }
);


test(
  "scanner V2 uses ZMACamera and never OPEN_QR",
  () => {
    assert.match(
      scannerSource,
      /createCameraContext/
    );

    assert.match(
      scannerSource,
      /camera\.start\(\)/
    );

    assert.match(
      scannerSource,
      /camera\?\.stop\?\.\(\)/
    );

    assert.match(
      scannerSource,
      /facingMode:\s*"environment"/
    );

    assert.doesNotMatch(
      scannerSource,
      /scanQRCode/
    );

    assert.doesNotMatch(
      scannerSource,
      /checkZaloCameraPermission/
    );

    assert.doesNotMatch(
      scannerSource,
      /requestCameraPermission/
    );

    assert.doesNotMatch(
      scannerSource,
      /CING_WALLET_POS_SCAN_NATIVE_FAILED/
    );
  }
);


test(
  "scanner V2 decodes raw video pixels with jsQR",
  () => {
    assert.match(
      scannerSource,
      /import jsQR from "jsqr"/
    );

    assert.match(
      scannerSource,
      /drawImage\(/
    );

    assert.match(
      scannerSource,
      /getImageData\(/
    );

    assert.match(
      scannerSource,
      /jsQR\(/
    );

    assert.match(
      scannerSource,
      /decoded\?\.data/
    );

    assert.match(
      scannerSource,
      /normalizeCingWalletQrContent/
    );
  }
);


test(
  "scanner V2 opens only from explicit customer action",
  () => {
    assert.doesNotMatch(
      pageSource,
      /useEffect\s*\([\s\S]{0,300}handleScan\s*\(\s*\)/
    );

    assert.match(
      pageSource,
      /onClick\s*=\s*\{\s*handleScan\s*\}/
    );

    assert.match(
      pageSource,
      /const cameraVideoRef\s*=\s*useRef\(null\)/
    );

    assert.match(
      pageSource,
      /ref=\{cameraVideoRef\}/
    );

    assert.match(
      pageSource,
      /videoElement:\s*cameraVideoRef\.current/
    );

    assert.match(
      pageSource,
      /Quét QR thanh toán/
    );
  }
);


test(
  "scanner V2 keeps camera element mounted before customer click",
  () => {
    assert.match(
      pageSource,
      /ref=\{cameraVideoRef\}/
    );

    assert.match(
      pageSource,
      /display:\s*scanning\s*\?\s*"block"\s*:\s*"none"/
    );

    assert.doesNotMatch(
      pageSource,
      /\{scanning\s*\?\s*\([\s\S]{0,400}<video/
    );
  }
);


test(
  "scanner V2 stops camera and clears media element in finally",
  () => {
    assert.match(
      scannerSource,
      /finally\s*\{/
    );

    assert.match(
      scannerSource,
      /camera\?\.stop\?\.\(\)/
    );

    assert.match(
      scannerSource,
      /videoElement\.pause\(\)/
    );

    assert.match(
      scannerSource,
      /videoElement\.srcObject\s*=\s*null/
    );
  }
);


test(
  "scanner V2 accepts only canonical Cing Wallet capability after decode",
  () => {
    assert.match(
      scannerSource,
      /CING_WALLET_PAY_V1\./
    );

    assert.match(
      scannerSource,
      /startsWith\(\s*CAPABILITY_PREFIX\s*\)/
    );

    assert.match(
      scannerSource,
      /return normalizeCingWalletQrContent\(\s*decoded\.data\s*\)/
    );
  }
);
