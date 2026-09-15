import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const source =
  fs.readFileSync(
    path.resolve(
      "src/features/admin/wallet-pos/AdminWalletPosCounter.jsx"
    ),
    "utf8"
  );

test(
  "paid event has a dedicated realtime presentation handler",
  () => {
    assert.match(
      source,
      /const paidEvent\s*=\s*"wallet\.pos\.payment\.paid"/
    );

    assert.match(
      source,
      /const handlePaidRealtime\s*=\s*payload\s*=>/
    );

    assert.match(
      source,
      /socket\.on\(\s*paidEvent,\s*handlePaidRealtime\s*\)/
    );

    assert.match(
      source,
      /socket\.off\(\s*paidEvent,\s*handlePaidRealtime\s*\)/
    );
  }
);

test(
  "paid realtime latch requires canonical settlement evidence",
  () => {
    const start =
      source.indexOf(
        "const handlePaidRealtime"
      );

    const end =
      source.indexOf(
        "const attach",
        start
      );

    assert.notEqual(
      start,
      -1
    );

    assert.notEqual(
      end,
      -1
    );

    const body =
      source.slice(
        start,
        end
      );

    for (
      const field
      of [
        "session_id",
        "payment_intent_id",
        "wallet_transaction_id",
        "paid_at",
        "amount",
      ]
    ) {
      assert.ok(
        body.includes(field),
        `missing ${field}`
      );
    }

    assert.match(
      body,
      /PAID_STATUSES\.has/
    );

    assert.match(
      body,
      /Number\.isSafeInteger/
    );

    assert.match(
      body,
      /amount\s*>\s*0/
    );
  }
);

test(
  "canonical paid broadcast latches terminal cashier presentation",
  () => {
    const start =
      source.indexOf(
        "const handlePaidRealtime"
      );

    const end =
      source.indexOf(
        "const attach",
        start
      );

    const body =
      source.slice(
        start,
        end
      );

    assert.match(
      body,
      /paidLatchRef\.current\s*=\s*true/
    );

    assert.match(
      body,
      /setLastPaidSession/
    );

    assert.match(
      body,
      /id:\s*payload\.session_id/
    );

    assert.match(
      body,
      /wallet_transaction_id:\s*payload\.wallet_transaction_id/
    );

    assert.match(
      body,
      /paid_at:\s*payload\.paid_at/
    );
  }
);

test(
  "dismissed terminal receipt cannot be resurrected by delayed paid event",
  () => {
    const start =
      source.indexOf(
        "const handlePaidRealtime"
      );

    const end =
      source.indexOf(
        "const attach",
        start
      );

    const body =
      source.slice(
        start,
        end
      );

    assert.match(
      body,
      /payload\.session_id\s*!==[\s\S]*dismissedPaidSessionIdRef[\s\S]*\.current/
    );
  }
);

test(
  "paid realtime remains presentation-only and converges through existing reader",
  () => {
    const start =
      source.indexOf(
        "const handlePaidRealtime"
      );

    const end =
      source.indexOf(
        "const attach",
        start
      );

    const body =
      source.slice(
        start,
        end
      );

    assert.match(
      body,
      /handleRealtime\(\)/
    );

    assert.doesNotMatch(
      body,
      /createWalletPosManualPayment\s*\(/
    );

    assert.doesNotMatch(
      body,
      /cancelWalletPosManualSession\s*\(/
    );

    assert.doesNotMatch(
      body,
      /apiClient/
    );
  }
);

test(
  "paid event is not also bound to generic handler",
  () => {
    const eventsStart =
      source.indexOf(
        "const events = ["
      );

    const eventsEnd =
      source.indexOf(
        "];",
        eventsStart
      );

    const eventsBlock =
      source.slice(
        eventsStart,
        eventsEnd
      );

    assert.equal(
      eventsBlock.includes(
        "wallet.pos.payment.paid"
      ),
      false
    );
  }
);

test(
  "1500ms polling durability fallback remains intact",
  () => {
    assert.match(
      source,
      /const POLL_INTERVAL_MS\s*=\s*1500/
    );

    assert.match(
      source,
      /window\.setInterval\([\s\S]*loadCurrent\([\s\S]*POLL_INTERVAL_MS/
    );
  }
);
