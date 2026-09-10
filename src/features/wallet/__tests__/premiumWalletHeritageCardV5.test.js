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
  "V6 uses the official local Cing logo as visible identity",
  () => {
    assert.match(
      page,
      /CING_BRAND_LOGO_URL\s*=\s*["']\/logo-cing\.png["']/
    );

    assert.match(
      page,
      /cing-wallet-hero__official-logo/
    );

    assert.match(
      page,
      /alt="Cing Hu Tang Kinh Bắc"/
    );

    assert.doesNotMatch(
      page,
      /watermark-logo/
    );
  }
);

test(
  "V6 removes the artificial C KB seal",
  () => {
    assert.doesNotMatch(
      page,
      /cing-wallet-hero__kinhbac-seal/
    );

    assert.doesNotMatch(
      page,
      /<span>C<\/span>/
    );

    assert.doesNotMatch(
      page,
      /<small>KB<\/small>/
    );
  }
);

test(
  "V6 contains explicit Kinh Bac cultural motifs",
  () => {
    assert.match(
      page,
      /cing-wallet-hero__roofline/
    );

    assert.match(
      page,
      /cing-wallet-hero__quai-thao/
    );

    assert.match(
      css,
      /CING WALLET HERITAGE CARD V6/
    );

    assert.match(
      css,
      /Kinh Bac Signature/
    );
  }
);

test(
  "V6 restores strong Cing brand hierarchy",
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
      /cing-wallet-hero__official-logo/
    );
  }
);

test(
  "V6 preserves canonical Wallet actions",
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

test(
  "V6 explicitly removes oversized V5 card minimum height",
  () => {
    assert.match(
      css,
      /cing-wallet-hero--heritage-v6[\s\S]*min-height:\s*0/
    );

    assert.doesNotMatch(
      css,
      /CING WALLET HERITAGE CARD V5/
    );
  }
);
