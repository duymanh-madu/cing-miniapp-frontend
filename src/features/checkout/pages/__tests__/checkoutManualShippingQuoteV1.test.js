import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "../CheckoutPage.jsx",
      import.meta.url
    ),
    "utf8"
  );


test(
  "manual shipping quote becomes contact state rather than error",
  () => {
    assert.match(
      source,
      /manual_shipping_quote_required/
    );

    assert.match(
      source,
      /manualShippingQuote[\s\S]*"contact"/
    );

    assert.match(
      source,
      /shipStatus!=="done"[\s\S]*shipStatus!=="contact"/
    );
  }
);


test(
  "manual quote zero cannot be displayed as free shipping",
  () => {
    assert.match(
      source,
      /shipStatus==="contact"[\s\S]*Phí ship: Cửa hàng liên hệ/
    );

    assert.match(
      source,
      /shipStatus==="contact"[\s\S]*Cửa hàng liên hệ/
    );
  }
);


test(
  "delivery UI displays backend road-distance authority",
  () => {
    assert.match(
      source,
      /result[\s\S]*shipping_distance_km/
    );

    assert.match(
      source,
      /setDistKm/
    );

    assert.match(
      source,
      /Quãng đường giao hàng:[\s\S]*distKm\.toFixed\(1\)/
    );

    assert.doesNotMatch(
      source,
      /Math\.sqrt[\s\S]{0,300}distKm/
    );
  }
);


test(
  "partial address match is advisory UX metadata",
  () => {
    assert.match(
      source,
      /address_match_partial/
    );

    assert.match(
      source,
      /Địa chỉ đã được Maps xác định gần đúng/
    );
  }
);


test(
  "manual quote payment copy explicitly excludes later shipping charge",
  () => {
    assert.match(
      source,
      /Chưa gồm phí ship/
    );

    assert.match(
      source,
      /Phí ship cửa hàng sẽ liên hệ/
    );
  }
);
