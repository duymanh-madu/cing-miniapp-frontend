import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source =
  fs.readFileSync(
    "src/features/admin/wallet-pos/AdminWalletPosCounter.jsx",
    "utf8"
  );

function slice(startMarker, endMarker) {
  const start =
    source.indexOf(startMarker);

  assert.notEqual(
    start,
    -1,
    startMarker
  );

  const end =
    source.indexOf(
      endMarker,
      start +
        startMarker.length
    );

  assert.notEqual(
    end,
    -1,
    endMarker
  );

  return source.slice(
    start,
    end
  );
}

test(
  "paid receipt owns presentation state independent of active session reader",
  () => {
    assert.match(
      source,
      /const \[lastPaidSession,\s*setLastPaidSession\]\s*=\s*useState\(null\)/
    );

    assert.match(
      source,
      /const paidSession\s*=\s*lastPaidSession/
    );

    const load =
      slice(
        "const loadCurrent",
        "const canCancelCurrent"
      );

    assert.match(
      load,
      /PAID_STATUSES\.has\([\s\S]*next\.status[\s\S]*setLastPaidSession/
    );
  }
);

test(
  "null active-session poll cannot clear terminal paid receipt",
  () => {
    const load =
      slice(
        "const loadCurrent",
        "const canCancelCurrent"
      );

    const nullBranch =
      load.indexOf(
        "!paidLatchRef.current"
      );

    assert.notEqual(
      nullBranch,
      -1
    );

    const tail =
      load.slice(
        nullBranch
      );

    assert.equal(
      tail.includes(
        "setLastPaidSession(\n              null"
      ),
      false
    );
  }
);

test(
  "only explicit next transaction clears paid receipt",
  () => {
    const next =
      slice(
        "const nextTransaction",
        "if (initialLoading)"
      );

    assert.match(
      next,
      /setLastPaidSession\(\s*null\s*\)/
    );

    assert.match(
      next,
      /setAmountDigits\(\s*""\s*\)/
    );

    assert.doesNotMatch(
      next,
      /loadCurrent\s*\(/
    );
  }
);

test(
  "qr uses backend expiry only as countdown deadline",
  () => {
    assert.match(
      source,
      /Date\.parse\(\s*current\.expires_at\s*\)/
    );

    assert.match(
      source,
      /expiresAt\s*-\s*Date\.now\(\)/
    );

    assert.match(
      source,
      /window\.setInterval\([\s\S]*1000/
    );

    assert.match(
      source,
      /QR còn hiệu lực/
    );

    assert.match(
      source,
      /\{qrCountdownLabel\}/
    );

    assert.doesNotMatch(
      source,
      /QR hiệu lực đến/
    );
  }
);

test(
  "countdown owns no payment authority",
  () => {
    const timer =
      slice(
        "const qrCountdownLabel",
        "const changeAmount"
      );

    for (
      const forbidden
      of [
        "createWalletPosManualPayment",
        "cancelWalletPosManualSession",
        ".rpc(",
        "supabase",
        "wallet_transaction",
        "reconciliation",
      ]
    ) {
      assert.equal(
        timer.includes(
          forbidden
        ),
        false,
        forbidden
      );
    }
  }
);

test(
  "cancel remains server authoritative and clears cashier bill only after cancelled result",
  () => {
    const cancel =
      slice(
        "const cancelCurrentSession",
        "useEffect("
      );

    const request =
      cancel.indexOf(
        "await cancelWalletPosManualSession"
      );

    const canonical =
      cancel.indexOf(
        'result?.session_status !=='
      );

    const clearAmount =
      cancel.indexOf(
        'setAmountDigits(',
        canonical
      );

    assert.ok(
      request >= 0 &&
      canonical > request &&
      clearAmount > canonical
    );

    assert.match(
      cancel,
      /requestId:\s*cancelRequestId/
    );

    assert.match(
      cancel,
      /reason:\s*"cashier_cancelled_current_session"/
    );
  }
);

test(
  "cancel eligibility remains pending states only",
  () => {
    const eligibility =
      slice(
        "const canCancelCurrent",
        "const cancelCurrentSession"
      );

    assert.match(
      eligibility,
      /amount_frozen/
    );

    assert.match(
      eligibility,
      /qr_ready/
    );

    assert.doesNotMatch(
      eligibility,
      /reconciliation_pending/
    );

    assert.doesNotMatch(
      eligibility,
      /paid/
    );
  }
);

test(
  "cancel HTTP uses canonical authenticated API config",
  () => {
    const api =
      fs.readFileSync(
        "src/features/admin/wallet-pos/adminWalletPosApi.js",
        "utf8"
      );

    const start =
      api.indexOf(
        "cancelWalletPosManualSession("
      );

    assert.notEqual(
      start,
      -1
    );

    const end =
      api.indexOf(
        "export async function",
        start + 10
      );

    assert.notEqual(
      end,
      -1
    );

    const cancel =
      api.slice(
        start,
        end
      );

    assert.match(
      cancel,
      /authConfig\(\s*token\s*\)/
    );

    assert.doesNotMatch(
      cancel,
      /authHeaders/
    );

    assert.match(
      cancel,
      /apiClient\.post/
    );

    assert.match(
      cancel,
      /\/manual-session\/\$\{encodeURIComponent\([\s\S]*\)\}\/cancel/
    );
  }
);

test(
  "paid dismissal uses retained receipt identity",
  () => {
    const next =
      slice(
        "const nextTransaction",
        "if (initialLoading)"
      );

    assert.match(
      next,
      /paidSession\?\.id/
    );

    assert.match(
      next,
      /dismissedPaidSessionIdRef[\s\S]*paidSession\.id/
    );

    assert.doesNotMatch(
      next,
      /PAID_STATUSES\.has\(\s*current\.status/
    );
  }
);
