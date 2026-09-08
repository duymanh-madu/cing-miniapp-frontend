import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";


const source =
  fs.readFileSync(
    "src/features/checkout/pages/CheckoutPage.jsx",
    "utf8"
  );


test(
  "GPS evidence and typed destination capability are separate states",
  () => {
    assert.match(
      source,
      /const \[deliveryCoords,setDeliveryCoords\]=useState\(null\)/
    );

    assert.match(
      source,
      /const \[deliveryCandidateToken,setDeliveryCandidateToken\]=useState\(""\)/
    );

    assert.match(
      source,
      /deliveryAddressRevisionRef=useRef\(0\)/
    );
  }
);


test(
  "typed destination is resolved through backend candidate authority",
  () => {
    assert.match(
      source,
      /apiClient\.post\(\s*"\/shipping\/resolve-address"/
    );

    assert.match(
      source,
      /address_text:[\s\S]*addressText/
    );

    assert.match(
      source,
      /current_latitude:[\s\S]*coords\.latitude/
    );

    assert.match(
      source,
      /current_longitude:[\s\S]*coords\.longitude/
    );

    assert.match(
      source,
      /order_amount:[\s\S]*subtotal/
    );
  }
);


test(
  "address edit immediately invalidates previous typed destination",
  () => {
    const start =
      source.indexOf(
        "const handleDeliveryAddressChange"
      );

    const end =
      source.indexOf(
        "const handleDeliveryAddressBlur",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const region =
      source.slice(
        start,
        end
      );

    assert.match(
      region,
      /setAddress\([\s\S]*value/
    );

    assert.match(
      region,
      /deliveryAddressRevisionRef[\s\S]*current \+= 1/
    );

    assert.match(
      region,
      /setDeliveryCandidateToken\(\s*""\s*\)/
    );

    assert.match(
      region,
      /setShipFee\(\s*0\s*\)/
    );

    assert.match(
      region,
      /setDistKm\(\s*null\s*\)/
    );

    assert.match(
      region,
      /"address_pending"/
    );
  }
);


test(
  "stale async typed-address response cannot restore old capability",
  () => {
    assert.match(
      source,
      /const revision =[\s\S]*deliveryAddressRevisionRef[\s\S]*current/
    );

    assert.match(
      source,
      /revision !==[\s\S]*deliveryAddressRevisionRef[\s\S]*current/
    );
  }
);


test(
  "accepted candidate owns displayed shipping estimate",
  () => {
    const start =
      source.indexOf(
        "const resolveTypedShippingAddress"
      );

    const end =
      source.indexOf(
        "const handleDeliveryAddressChange",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const region =
      source.slice(
        start,
        end
      );

    assert.match(
      region,
      /result\.shipping_fee/
    );

    assert.match(
      region,
      /shipping_distance_km/
    );

    assert.match(
      region,
      /setDeliveryCandidateToken\([\s\S]*candidate_token/
    );

    assert.match(
      region,
      /setShipStatus\([\s\S]*manualShippingQuote[\s\S]*\?\s*"contact"[\s\S]*:\s*"done"[\s\S]*\)/
    );
  }
);


test(
  "legacy GPS estimate endpoint no longer owns typed destination shipping",
  () => {
    assert.doesNotMatch(
      source,
      /\/shipping\/estimate\?lat=/
    );
  }
);


test(
  "leaving delivery invalidates both GPS and candidate capability",
  () => {
    const start =
      source.indexOf(
        'if(orderType!=="delivery"){'
      );

    const end =
      source.indexOf(
        "refreshShippingLocation();",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const region =
      source.slice(
        start,
        end
      );

    assert.match(
      region,
      /setDeliveryCoords\(null\)/
    );

    assert.match(
      region,
      /setDeliveryCandidateToken\(""\)/
    );

    assert.match(
      region,
      /setShipStatus\("idle"\)/
    );
  }
);


test(
  "checkout fails closed without fresh candidate",
  () => {
    const start =
      source.indexOf(
        "async function handleOrder()"
      );

    const post =
      source.indexOf(
        '"/checkout/create"',
        start
      );

    const region =
      source.slice(
        start,
        post
      );

    assert.match(
      region,
      /let checkoutCandidateToken =[\s\S]*deliveryCandidateToken/
    );

    assert.match(
      region,
      /shipStatus!=="done"[\s\S]*!checkoutCandidateToken/
    );

    assert.match(
      region,
      /await resolveTypedShippingAddress\([\s\S]*address[\s\S]*deliveryCoords/
    );
  }
);


test(
  "checkout sends current GPS and signed candidate separately",
  () => {
    const post =
      source.indexOf(
        '"/checkout/create"'
      );

    assert.ok(
      post >= 0
    );

    const region =
      source.slice(
        post,
        post + 5200
      );

    assert.match(
      region,
      /destination_latitude:[\s\S]*deliveryCoords\?\.latitude/
    );

    assert.match(
      region,
      /destination_longitude:[\s\S]*deliveryCoords\?\.longitude/
    );

    assert.match(
      region,
      /candidate_token:[\s\S]*checkoutCandidateToken/
    );
  }
);


test(
  "non-destination presentation edits do not invalidate candidate",
  () => {
    assert.match(
      source,
      /onChange=\{setName\}/
    );

    assert.match(
      source,
      /onChange=\{setPhone\}/
    );

    assert.match(
      source,
      /setNote\(e\.target\.value\)/
    );
  }
);
