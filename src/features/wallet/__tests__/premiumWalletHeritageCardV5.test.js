import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page =
  fs.readFileSync(
    new URL(
      "../pages/WalletPage.jsx",
      import.meta.url
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    new URL(
      "../pages/wallet-page.css",
      import.meta.url
    ),
    "utf8"
  );

test(
  "Heritage Card uses local Cing asset",
  () => {
    assert.match(
      page,
      /["']\/logo-cing\.png["']/
    );

    assert.doesNotMatch(
      page,
      /supabase\.co\/storage\/v1\/object\/public\/Logo/
    );
  }
);

test(
  "generic Wallet plaque composition is removed",
  () => {
    assert.doesNotMatch(
      page,
      /WalletGlyph/
    );

    assert.doesNotMatch(
      page,
      /cing-wallet-hero__brand-logo/
    );

    assert.match(
      page,
      /cing-wallet-hero__brand-lockup/
    );

    assert.match(
      page,
      /cing-wallet-hero__kinhbac-seal/
    );
  }
);

test(
  "Cing Hu Tang Kinh Bac identity is explicit",
  () => {
    assert.match(
      page,
      /CING HU TANG/
    );

    assert.match(
      page,
      /KINH BẮC/
    );

    assert.match(
      page,
      /CING WALLET/
    );

    assert.match(
      css,
      /CING WALLET HERITAGE CARD V5/
    );
  }
);

test(
  "canonical topup and POS actions remain unchanged",
  () => {
    assert.match(
      page,
      />\s*Nạp tiền\s*</
    );

    assert.match(
      page,
      /\/wallet\/pos-pay/
    );

    assert.match(
      page,
      /Quét QR tại quầy/
    );
  }
);
