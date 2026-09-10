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


test(
  "V9 uses direct official logo with sunlight",
  () => {
    assert.match(
      source,
      /src="\/logo-cing\.png"/
    );

    assert.match(
      source,
      /cing-wallet-v9__sunlight/
    );

    assert.match(
      css,
      /cing-wallet-v9__sunlight/
    );
  }
);


test(
  "V9 places Wallet title opposite the logo",
  () => {
    const top =
      source.indexOf(
        "cing-wallet-v9__top"
      );

    const logo =
      source.indexOf(
        "cing-wallet-v9__logo-wrap"
      );

    const title =
      source.indexOf(
        "cing-wallet-v9__title"
      );

    assert.ok(
      top >= 0 &&
      logo > top &&
      title > logo
    );

    assert.match(
      css,
      /cing-wallet-v9__top[\s\S]*justify-content:\s*space-between/
    );
  }
);


test(
  "V9 balance label is flush-left directly above amount",
  () => {
    const label =
      source.indexOf(
        "cing-wallet-v9__balance-label"
      );

    const amount =
      source.indexOf(
        "cing-wallet-v9__amount"
      );

    assert.ok(
      label >= 0 &&
      amount > label
    );
  }
);


test(
  "V9 removes coarse circular ornament system",
  () => {
    assert.doesNotMatch(
      source,
      /ornament--fan|ornament--wave|ornament--roof|medallion/
    );

    assert.match(
      source,
      /cing-wallet-v9__heritage-scene/
    );
  }
);


test(
  "V9 preserves canonical Wallet actions",
  () => {
    assert.match(
      source,
      /Nạp tiền/
    );

    assert.match(
      source,
      /Quét QR tại quầy/
    );

    assert.match(
      source,
      /"\/wallet\/pos-pay"/
    );
  }
);
