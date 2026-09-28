import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT =
  path.resolve(
    import.meta.dirname,
    "../../.."
  );

function read(relative) {
  return fs.readFileSync(
    path.join(
      ROOT,
      relative
    ),
    "utf8"
  );
}

const client =
  read(
    "games/runtime/offlineRevivalAuthorityClient.js"
  );

const coordinator =
  read(
    "games/runtime/offlineRevivalStartCoordinator.js"
  );

const wrapper =
  read(
    "features/game-center/components/CingOfflineRevivalGameV2.jsx"
  );

test(
  "authority client exposes exact abandon route",
  () => {
    assert.match(
      client,
      /abandonOfflineRevivalSession/
    );

    assert.match(
      client,
      /"\/abandon"/
    );

    assert.match(
      client,
      /expected_event_seq/
    );
  }
);

test(
  "wrapper wires backend safe abandon into start coordinator",
  () => {
    assert.match(
      wrapper,
      /abandonOfflineRevivalSession/
    );

    assert.match(
      wrapper,
      /abandonSession:\s*abandonOfflineRevivalSession/
    );
  }
);

test(
  "fresh admission remains independent from balance and price reads",
  () => {
    assert.doesNotMatch(
      coordinator,
      /getOfflineRevivalCreditBalance|price/
    );

    assert.match(
      coordinator,
      /await startSession/
    );
  }
);

test(
  "ambiguous abandon retains durable fence",
  () => {
    const abandon =
      coordinator.indexOf(
        "await abandonSession"
      );

    const clear =
      coordinator.indexOf(
        "clearOfflineRevivalStartIntent",
        abandon
      );

    assert.ok(abandon >= 0);
    assert.ok(clear > abandon);
  }
);
