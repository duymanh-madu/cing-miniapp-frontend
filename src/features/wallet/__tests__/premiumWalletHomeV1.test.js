import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "../components/HomeWalletSnapshot.jsx",
      import.meta.url
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    new URL(
      "../components/home-wallet.css",
      import.meta.url
    ),
    "utf8"
  );


test(
  "Home V9 restores genuine WalletGlyph",
  () => {
    assert.match(
      source,
      /import WalletGlyph/
    );

    assert.match(
      source,
      /<WalletGlyph/
    );

    assert.match(
      source,
      /size=\{31\}/
    );
  }
);


test(
  "Home V9 does not render brand logo",
  () => {
    assert.doesNotMatch(
      source,
      /logo-cing\.png/
    );
  }
);


test(
  "Home V9 uses refined heritage scene instead of coarse rings",
  () => {
    assert.match(
      source,
      /cing-home-wallet-v9__heritage/
    );

    assert.doesNotMatch(
      source,
      /ornament--fan|ornament--wave|header-chip/
    );
  }
);


test(
  "Home V9 actions are independent and three dimensional",
  () => {
    assert.match(
      source,
      /cing-home-wallet-v9__action--primary/
    );

    assert.match(
      source,
      /cing-home-wallet-v9__action--secondary/
    );

    assert.match(
      css,
      /cing-home-wallet-v9__actions[\s\S]*gap:\s*14px/
    );

    assert.match(
      css,
      /cing-home-wallet-v9__action--primary[\s\S]*box-shadow/
    );
  }
);


test(
  "Home V9 preserves canonical navigation actions",
  () => {
    assert.match(
      source,
      /walletAction:\s*"topup"/
    );

    assert.match(
      source,
      /navigate\(\s*"\/menu"/
    );

    assert.match(
      source,
      /navigate\(\s*"\/wallet"/
    );
  }
);
