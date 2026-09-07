import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


const modal =
  fs.readFileSync(
    "src/features/cart/ProductOptionsModal.jsx",
    "utf8"
  );

const cart =
  fs.readFileSync(
    "src/features/menu/store/cartStore.js",
    "utf8"
  );

const menuGrid =
  fs.readFileSync(
    "src/features/menu/components/MenuGrid.jsx",
    "utf8"
  );


test(
  "removes every hardcoded topping slug and price table",
  () => {

    assert.doesNotMatch(
      modal,
      /const\s+TOPPINGS\s*=/
    );

    assert.doesNotMatch(
      modal,
      /tran_chau_den|kem_cheese|thach_o_long|pudding/
    );

  }
);


test(
  "renders the iPOS customization graph supplied by the menu item",
  () => {

    assert.match(
      modal,
      /item\?\.customizations/
    );

    assert.match(
      modal,
      /group\?\.options/
    );

    assert.match(
      modal,
      /option\?\.ta_price/
    );

  }
);


test(
  "accepts only active ITEM identities from customization graph",
  () => {

    assert.match(
      modal,
      /ITEM-\[A-Za-z0-9_-\]/
    );

    assert.match(
      modal,
      /status\s*!==\s*"ACTIVE"/
    );

  }
);


test(
  "cart line freezes ITEM option identities",
  () => {

    assert.match(
      modal,
      /customization_option_ids:\s*optionIds/
    );

    assert.match(
      modal,
      /store_item_id:\s*canonicalBaseId/
    );

  }
);


test(
  "cart V2 identity never uses client price",
  () => {

    const keyStart =
      cart.indexOf(
        "function getCartKey"
      );

    const keyEnd =
      cart.indexOf(
        "function matchesCartLine",
        keyStart
      );

    assert.ok(
      keyStart >= 0
    );

    assert.ok(
      keyEnd > keyStart
    );

    const region =
      cart.slice(
        keyStart,
        keyEnd
      );

    assert.match(
      region,
      /customization_option_ids/
    );

    assert.doesNotMatch(
      region,
      /\bprice\b/
    );

  }
);


test(
  "legacy slug cart storage is intentionally invalidated",
  () => {

    assert.match(
      cart,
      /cing_cart_session_v2/
    );

    assert.match(
      cart,
      /removeItem\(\s*LEGACY_CART_KEY\s*\)/
    );

  }
);


test(
  "MenuGrid still passes complete selected menu item into modal",
  () => {

    assert.match(
      menuGrid,
      /<ProductOptionsModal[\s\S]*item=\{selectedItem\}/
    );

  }
);
