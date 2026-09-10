import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
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

function getHeroSegment() {
  const start =
    source.indexOf(
      '<section className="cing-wallet-hero'
    );
  const end =
    source.indexOf(
      "<WalletQuickServices"
    );

  return source.slice(
    start,
    end
  );
}

test(
  "V7 uses illuminated official Cing logo block",
  () => {
    const hero =
      getHeroSegment();

    assert.match(
      hero,
      /cing-wallet-hero__brand-mark/
    );

    assert.match(
      hero,
      /src="\/logo-cing\.png"/
    );

    assert.match(
      css,
      /cing-wallet-hero__logo-halo/
    );
  }
);

test(
  "V7 removes duplicated Cing Hu Tang and Kinh Bac hero text",
  () => {
    const hero =
      getHeroSegment();

    assert.ok(
      !hero.includes(
        "CING HU TANG"
      )
    );

    assert.ok(
      !hero.includes(
        "KINH BẮC"
      )
    );
  }
);

test(
  "V7 introduces restrained heritage ornaments",
  () => {
    const hero =
      getHeroSegment();

    assert.match(
      hero,
      /cing-wallet-hero__ornament--roof/
    );

    assert.match(
      hero,
      /cing-wallet-hero__ornament--fan/
    );

    assert.match(
      hero,
      /cing-wallet-hero__ornament--wave/
    );
  }
);

test(
  "V7 preserves canonical Wallet actions",
  () => {
    const hero =
      getHeroSegment();

    assert.match(
      hero,
      /Nạp tiền/
    );

    assert.match(
      hero,
      /Quét QR tại quầy/
    );

    assert.match(
      hero,
      /"\/wallet\/pos-pay"/
    );
  }
);

test(
  "V8 removes top-right three-line wallet symbol",
  () => {
    const hero =
      getHeroSegment();

    assert.doesNotMatch(
      hero,
      /cing-wallet-hero__medallion/
    );

    assert.match(
      css,
      /cing-wallet-hero__medallion[\s\S]*display:\s*none/
    );
  }
);
