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
  "scanner uses native Zalo scanQRCode and exact content field",
  () => {
    assert.match(
      scannerSource,
      /import\(\s*"zmp-sdk\/apis"\s*\)/
    );

    assert.match(
      scannerSource,
      /scanQRCode\(\)/
    );

    assert.match(
      scannerSource,
      /result\?\.content/
    );
  }
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
  "scanner bypasses hanging permission APIs and invokes scanQRCode directly",
  () => {
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
      /CING_WALLET_POS_CAMERA_CHECK_TIMEOUT/
    );

    assert.doesNotMatch(
      scannerSource,
      /CING_WALLET_POS_CAMERA_REQUEST_TIMEOUT/
    );

    assert.doesNotMatch(
      scannerSource,
      /CING_WALLET_POS_CAMERA_PERMISSION_DENIED/
    );

    assert.match(
      scannerSource,
      /scanQRCode/
    );

    assert.match(
      scannerSource,
      /withNativeTimeout/
    );

    assert.match(
      scannerSource,
      /CING_WALLET_POS_SCAN_TIMEOUT/
    );

    assert.match(
      scannerSource,
      /result\?\.content/
    );
  }
);

test(
  "POS scanner opens only from explicit customer action",
  () => {
    assert.doesNotMatch(
      pageSource,
      /useEffect\s*\([\s\S]{0,250}handleScan\s*\(\s*\)/
    );

    assert.match(
      pageSource,
      /onClick\s*=\s*\{\s*handleScan\s*\}/
    );

    assert.match(
      pageSource,
      /Quét QR thanh toán/
    );
  }
);
