import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";


const source =
  fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/features/checkout/pages/CheckoutPage.jsx"
    ),
    "utf8"
  );


test(
  "persists delivery coordinates",
  () => {
    /*
     * Current GPS evidence is normalized before it is stored.
     * The implementation no longer rebuilds an inline object
     * inside setDeliveryCoords().
     */
    assert.match(
      source,
      /const coords =\s*[\s\S]*normalizeDeliveryCoords\(/
    );

    assert.match(
      source,
      /setDeliveryCoords\(\s*coords\s*\)/
    );

    assert.match(
      source,
      /const normalizeDeliveryCoords =[\s\S]*latitude[\s\S]*longitude/
    );
  }
);
test(
  "unified checkout submits persisted delivery coordinates",
  () => {

    assert.match(
      source,
      /destination_latitude:[\s\S]*deliveryCoords\?\.latitude/
    );

    assert.match(
      source,
      /destination_longitude:[\s\S]*deliveryCoords\?\.longitude/
    );

    assert.doesNotMatch(
      source,
      /location\?\.lat/
    );

    assert.doesNotMatch(
      source,
      /location\?\.lng/
    );

  }
);


test(
  "non-delivery resets shipping state",
  () => {

    assert.match(
      source,
      /orderType!=="delivery"[\s\S]*setShipFee\(0\)[\s\S]*setDistKm\(null\)[\s\S]*setDeliveryCoords\(null\)/
    );

  }
);


test(
  "contains no local shipping calculators or config",
  () => {

    assert.doesNotMatch(
      source,
      /function calcShipFee/
    );

    assert.doesNotMatch(
      source,
      /function calcDistKm/
    );

    assert.doesNotMatch(
      source,
      /STORE_LAT/
    );

    assert.doesNotMatch(
      source,
      /STORE_LNG/
    );

    assert.doesNotMatch(
      source,
      /shippingTiers/
    );

  }
);


test(
  "consumes backend shipping fee and distance",
  () => {
    /*
     * Typed-address shipping preview now comes from the
     * authenticated /shipping/resolve-address authority.
     */
    assert.match(
      source,
      /apiClient\.post\(\s*"\/shipping\/resolve-address"/
    );

    assert.match(
      source,
      /result\.shipping_fee/
    );

    assert.match(
      source,
      /shipping_distance_km/
    );

    assert.match(
      source,
      /setShipFee\(\s*fee\s*\)/
    );

    assert.match(
      source,
      /setDistKm\(/
    );

    assert.doesNotMatch(
      source,
      /\/shipping\/estimate\?lat=/
    );
  }
);
test(
  "blocks delivery checkout until canonical location exists",
  () => {
    /*
     * Delivery checkout requires:
     *   1. valid current GPS evidence
     *   2. successful typed-address resolution
     *   3. fresh backend-signed candidate capability
     */
    assert.match(
      source,
      /orderType==="delivery"[\s\S]*!deliveryCoords/
    );

    assert.match(
      source,
      /let checkoutCandidateToken =[\s\S]*deliveryCandidateToken/
    );

    assert.match(
      source,
      /shipStatus!=="done"[\s\S]*!checkoutCandidateToken/
    );

    assert.match(
      source,
      /await resolveTypedShippingAddress\([\s\S]*address[\s\S]*deliveryCoords/
    );

    assert.match(
      source,
      /candidate_token:[\s\S]*checkoutCandidateToken/
    );
  }
);
