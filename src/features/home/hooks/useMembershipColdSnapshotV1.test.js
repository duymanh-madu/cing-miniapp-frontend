import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    "src/features/home/hooks/useMembership.jsx",
    "utf8"
  );

test(
  "membership cold start reads persistent snapshot",
  () => {
    assert.match(
      source,
      /cing_membership_snapshot_v1:/
    );

    assert.match(
      source,
      /localStorage\.getItem/
    );

    assert.match(
      source,
      /initialData:[\s\S]*readMembershipSnapshot/
    );
  }
);

test(
  "fresh membership response refreshes persistent snapshot",
  () => {
    assert.match(
      source,
      /persistMembershipSnapshot\([\s\S]*phone,[\s\S]*data/
    );
  }
);

test(
  "snapshot never replaces canonical backend refresh",
  () => {
    assert.match(
      source,
      /apiClient\.get\([\s\S]*`\/membership\/\$\{phone\}`/
    );

    assert.match(
      source,
      /initialDataUpdatedAt:[\s\S]*0/
    );
  }
);
