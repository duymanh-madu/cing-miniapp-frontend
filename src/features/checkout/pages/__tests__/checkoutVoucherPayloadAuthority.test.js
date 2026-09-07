import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

const checkoutSource = fs.readFileSync(
  path.resolve(
    __dirname,
    "../CheckoutPage.jsx"
  ),
  "utf8"
);

test(
  "checkout has no orphan selectedVoucher runtime reference",
  () => {
    assert.doesNotMatch(
      checkoutSource,
      /\bselectedVoucher\b/
    );
  }
);

test(
  "checkout does not submit voucher_code without canonical voucher selection authority",
  () => {
    const checkoutCallIndex =
      checkoutSource.indexOf(
        '"/checkout/create"'
      );

    assert.notEqual(
      checkoutCallIndex,
      -1
    );

    const checkoutRegion =
      checkoutSource.slice(
        checkoutCallIndex,
        checkoutCallIndex + 5000
      );

    assert.doesNotMatch(
      checkoutRegion,
      /\bvoucher_code\s*:/
    );
  }
);
