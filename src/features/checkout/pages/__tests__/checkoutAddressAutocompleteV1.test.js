import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    "src/features/checkout/pages/CheckoutPage.jsx",
    "utf8"
  );


test(
  "Google provider remains backend-only",
  () => {

    assert.doesNotMatch(
      source,
      /GOOGLE_MAPS_PLACES_API_KEY/
    );

    assert.doesNotMatch(
      source,
      /places\.googleapis\.com/
    );

    assert.doesNotMatch(
      source,
      /routes\.googleapis\.com/
    );
  }
);


test(
  "autocomplete uses secure session and backend proxy",
  () => {

    assert.match(
      source,
      /ADDRESS_AUTOCOMPLETE_SESSION_PATTERN/
    );

    assert.match(
      source,
      /globalThis\.crypto[\s\S]*randomUUID/
    );

    assert.match(
      source,
      /apiClient\.post\(\s*"\/shipping\/address-suggestions"/
    );

    assert.match(
      source,
      /ADDRESS_AUTOCOMPLETE_DEBOUNCE_MS\s*=\s*300/
    );

    assert.match(
      source,
      /\.slice\(\s*0,\s*5\s*\)/
    );
  }
);


test(
  "selected prediction resolves through backend Place authority",
  () => {

    const start =
      source.indexOf(
        "const resolveSelectedShippingPlace"
      );

    const end =
      source.indexOf(
        "const handleDeliveryAddressChange",
        start
      );

    const region =
      source.slice(
        start,
        end
      );

    assert.match(
      region,
      /\/shipping\/resolve-place/
    );

    assert.match(
      region,
      /place_id:[\s\S]*placeId/
    );

    assert.match(
      region,
      /session_token:[\s\S]*sessionToken/
    );

    assert.match(
      region,
      /current_latitude:[\s\S]*coords\.latitude/
    );

    assert.match(
      region,
      /current_longitude:[\s\S]*coords\.longitude/
    );
  }
);


test(
  "raw and selected resolution share backend shipping projection",
  () => {

    assert.match(
      source,
      /const applyShippingResolutionResult =/
    );

    assert.match(
      source,
      /resolveTypedShippingAddress[\s\S]*applyShippingResolutionResult\(\{[\s\S]*canonicalizeAddress:[\s\S]*false/
    );

    assert.match(
      source,
      /resolveSelectedShippingPlace[\s\S]*applyShippingResolutionResult\(\{[\s\S]*canonicalizeAddress:[\s\S]*true/
    );
  }
);


test(
  "backend owns canonical address fee road distance and candidate",
  () => {

    const start =
      source.indexOf(
        "const applyShippingResolutionResult"
      );

    const end =
      source.indexOf(
        "const resolveSelectedShippingPlace",
        start
      );

    const region =
      source.slice(
        start,
        end
      );

    assert.match(
      region,
      /formatted_address/
    );

    assert.match(
      region,
      /candidate_token/
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
      /manual_shipping_quote_required/
    );
  }
);


test(
  "address edit invalidates selected place and candidate",
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

    const region =
      source.slice(
        start,
        end
      );

    assert.match(
      region,
      /deliveryAddressRevisionRef[\s\S]*current \+= 1/
    );

    assert.match(
      region,
      /addressAutocompleteQueryRevisionRef[\s\S]*current \+= 1/
    );

    assert.match(
      region,
      /setSelectedDeliveryPlaceId\(\s*""\s*\)/
    );

    assert.match(
      region,
      /setDeliveryCandidateToken\(\s*""\s*\)/
    );
  }
);


test(
  "raw resolver survives only as compatibility fallback",
  () => {

    assert.match(
      source,
      /\/shipping\/resolve-address/
    );

    const selectedStart =
      source.indexOf(
        "const resolveSelectedShippingPlace"
      );

    const selectedEnd =
      source.indexOf(
        "const handleDeliveryAddressChange",
        selectedStart
      );

    assert.doesNotMatch(
      source.slice(
        selectedStart,
        selectedEnd
      ),
      /\/shipping\/resolve-address/
    );
  }
);


test(
  "GPS refresh cannot silently bypass autocomplete",
  () => {

    const start =
      source.indexOf(
        "const refreshShippingLocation"
      );

    const end =
      source.indexOf(
        "const [paymentMethod",
        start
      );

    const region =
      source.slice(
        start,
        end
      );

    assert.doesNotMatch(
      region,
      /await resolveTypedShippingAddress/
    );

    assert.match(
      region,
      /Hãy chọn địa chỉ gợi ý phù hợp/
    );
  }
);


test(
  "suggestion list displays Google Maps attribution",
  () => {

    assert.match(
      source,
      /aria-label="Google Maps"/
    );

    assert.match(
      source,
      />\s*Google Maps\s*</
    );
  }
);


test(
  "checkout idempotency remains intact",
  () => {

    assert.match(
      source,
      /checkout_request_id:[\s\S]*checkoutRequestId/
    );

    assert.match(
      source,
      /const checkoutIntentFingerprint =[\s\S]*shipping_address/
    );

    assert.match(
      source,
      /const checkoutIntentFingerprint =[\s\S]*candidate_token/
    );

    assert.match(
      source,
      /COMMERCE_CHECKOUT_IDEMPOTENCY_CONFLICT/
    );
  }
);


test(
  "suggestion pointer-down prevents blur from racing raw fallback",
  () => {

    const start =
      source.indexOf(
        "function DeliveryAddressAutocompleteField"
      );

    const end =
      source.indexOf(
        "export default function CheckoutPage",
        start
      );

    const region =
      source.slice(
        start,
        end
      );

    assert.match(
      region,
      /onPointerDown=\{e=>\{[\s\S]*e\.preventDefault\(\)/
    );

    assert.match(
      region,
      /onClick=\{\(\)=>[\s\S]*onSelect/
    );
  }
);


test(
  "stale autocomplete responses are fenced by query and destination revisions",
  () => {

    const endpoint =
      source.indexOf(
        '"/shipping/address-suggestions"'
      );

    assert.ok(
      endpoint >= 0
    );

    const start =
      source.lastIndexOf(
        "useEffect(()=>",
        endpoint
      );

    const end =
      source.indexOf(
        'const pendingCheckoutKey',
        endpoint
      );

    const region =
      source.slice(
        start,
        end
      );

    assert.match(
      region,
      /const queryRevision =[\s\S]*addressAutocompleteQueryRevisionRef/
    );

    assert.match(
      region,
      /const destinationRevision =[\s\S]*deliveryAddressRevisionRef/
    );

    assert.match(
      region,
      /queryRevision !==[\s\S]*addressAutocompleteQueryRevisionRef/
    );

    assert.match(
      region,
      /destinationRevision !==[\s\S]*deliveryAddressRevisionRef/
    );
  }
);


test(
  "selected marker is installed before backend canonical address rewrite",
  () => {

    const start =
      source.indexOf(
        "const resolveSelectedShippingPlace"
      );

    const end =
      source.indexOf(
        "const handleDeliveryAddressChange",
        start
      );

    const region =
      source.slice(
        start,
        end
      );

    const marker =
      region.indexOf(
        "setSelectedDeliveryPlaceId("
      );

    const projection =
      region.indexOf(
        "applyShippingResolutionResult({"
      );

    assert.ok(
      marker >= 0
    );

    assert.ok(
      projection > marker
    );

    assert.match(
      region,
      /if\(!candidateToken\)[\s\S]*setSelectedDeliveryPlaceId\(\s*""\s*\)/
    );
  }
);
