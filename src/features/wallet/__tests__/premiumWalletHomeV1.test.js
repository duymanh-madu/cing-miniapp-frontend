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
  "Home snapshot uses official logo plaque and halo",
  () => {
    assert.match(
      source,
      /cing-home-wallet--heritage-v2/
    );

    assert.match(
      source,
      /src="\/logo-cing\.png"/
    );

    assert.match(
      source,
      /cing-home-wallet__logo-plaque/
    );

    assert.match(
      css,
      /cing-home-wallet__logo-plaque::before/
    );
  }
);

test(
  "Home snapshot adds restrained heritage ornaments",
  () => {
    assert.match(
      source,
      /cing-home-wallet__ornament--fan/
    );

    assert.match(
      source,
      /cing-home-wallet__ornament--wave/
    );
  }
);

test(
  "Home snapshot preserves canonical actions",
  () => {
    assert.match(
      source,
      /walletAction:\s*"topup"/
    );

    assert.match(
      source,
      /navigate\(\s*"\/wallet"/
    );

    assert.match(
      source,
      /navigate\(\s*"\/menu"/
    );
  }
);

test(
  "Home snapshot no longer depends on generic WalletGlyph orb",
  () => {
    assert.ok(
      !source.includes(
        "WalletGlyph"
      )
    );
  }
);

test(
  "Home V8 removes top-right three-line chip",
  () => {
    assert.doesNotMatch(
      source,
      /cing-home-wallet__header-chip/
    );

    assert.match(
      css,
      /cing-home-wallet__header-chip[\s\S]*display:\s*none/
    );
  }
);

test(
  "Home V8 does not display brand logo in card",
  () => {
    assert.match(
      css,
      /cing-home-wallet__logo[\s\S]*display:\s*none/
    );
  }
);
