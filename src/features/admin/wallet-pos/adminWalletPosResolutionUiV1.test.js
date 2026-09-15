import fs
  from "node:fs";

import test
  from "node:test";

import assert
  from "node:assert/strict";


const counter =
  fs.readFileSync(
    "src/features/admin/wallet-pos/AdminWalletPosCounter.jsx",
    "utf8"
  );

const api =
  fs.readFileSync(
    "src/features/admin/wallet-pos/adminWalletPosApi.js",
    "utf8"
  );

const dashboard =
  fs.readFileSync(
    "src/features/admin/components/AdminDashboard.jsx",
    "utf8"
  );


function resolutionApiBody() {

  const start =

    api.indexOf(

      "resolveWalletPosAlert"

    );

  assert.ok(

    start >= 0

  );

  return api.slice(

    start

  );

}


function resolveAlertBody() {

  const start =

    counter.indexOf(

      "const resolveAlert"

    );

  const end =

    counter.indexOf(

      "const nextTransaction",

      start

    );

  assert.ok(

    start >= 0 &&

    end > start

  );

  return counter.slice(

    start,

    end

  );

}


test(

  "Counter receives exact authenticated admin role",

  () => {

    assert.match(

      dashboard,

      /AdminWalletPosCounter token=\{auth\.token\} role=\{auth\.admin\?\.role\}/

    );

    assert.doesNotMatch(

      dashboard,

      /AdminWalletPosCounter token=\{auth\.token\} role=\{role\}/

    );

  }

);


test(

  "resolution controls remain Super Admin only",

  () => {

    assert.match(

      counter,

      /const isSuperAdmin =[\s\S]*role[\s\S]*"super_admin"/

    );

    assert.match(

      counter,

      /\{isSuperAdmin &&[\s\S]*alerts\.length > 0/

    );

  }

);


test(

  "resolution API sends decision fields only",

  () => {

    const body =

      resolutionApiBody();

    for (

      const required

      of [

        "request_id",

        "resolution_action",

        "reason_code",

      ]

    ) {

      assert.match(

        body,

        new RegExp(

          required

        )

      );

    }

    for (

      const forbidden

      of [

        "user_id",

        "customer_user_id",

        "actor_id",

        "amount",

        "direction",

        "expected_amount",

        "actual_amount",

        "difference_amount",

        "wallet_transaction_id",

        "payment_intent_id",

        "pos_parent",

        "pos_id",

      ]

    ) {

      assert.doesNotMatch(

        body,

        new RegExp(

          forbidden

        )

      );

    }

  }

);


test(

  "financial action availability follows canonical mismatch sign",

  () => {

    assert.match(

      counter,

      /alert_type ===[\s\S]*"amount_mismatch"/

    );

    assert.match(

      counter,

      /difference > 0[\s\S]*"compensating_debit"/

    );

    assert.match(

      counter,

      /difference < 0[\s\S]*"compensating_credit"/

    );

  }

);


test(

  "resolution UI exposes no customer amount or direction input",

  () => {

    for (

      const forbidden

      of [

        "amount",

        "user_id",

        "customer_user_id",

        "direction",

        "wallet_transaction_id",

        "payment_intent_id",

        "pos_parent",

        "pos_id",

      ]

    ) {

      assert.doesNotMatch(

        counter,

        new RegExp(

          `name=["']${forbidden}["']`

        )

      );

    }

  }

);


test(

  "financial correction requires note",

  () => {

    const body =

      resolveAlertBody();

    assert.match(

      body,

      /"compensating_debit"[\s\S]*"compensating_credit"/

    );

    assert.match(

      body,

      /isFinancial &&[\s\S]*!note/

    );

  }

);


test(

  "resolution uses secure sticky UUID identity",

  () => {

    const body =

      resolveAlertBody();

    assert.match(

      body,

      /createRequestId\(\)/

    );

    assert.match(

      body,

      /resolutionRequestRef[\s\S]*\.get/

    );

    assert.match(

      body,

      /resolutionRequestRef[\s\S]*\.set/

    );

    assert.match(

      counter,

      /cryptoApi[\s\S]*randomUUID/

    );

    assert.match(

      counter,

      /cryptoApi\.getRandomValues/

    );

    assert.doesNotMatch(

      counter,

      /Math\.random/

    );

  }

);


test(

  "successful resolution refetches canonical alerts before releasing request identity",

  () => {

    const body =

      resolveAlertBody();

    const networkAt =

      body.indexOf(

        "resolveWalletPosAlert("

      );

    const refetchAt =

      body.indexOf(

        "loadAlerts({"

      );

    const deleteAt =

      body.indexOf(

        ".delete(",

        refetchAt

      );

    assert.ok(

      networkAt >= 0

    );

    assert.ok(

      refetchAt > networkAt

    );

    assert.ok(

      deleteAt > refetchAt

    );

    assert.match(

      body,

      /await loadAlerts\(\{[\s\S]*strict:[\s\S]*true/

    );

  }

);


test(

  "failed resolution does not optimistically mutate alert state",

  () => {

    const body =

      resolveAlertBody();

    assert.doesNotMatch(

      body,

      /setAlerts\([\s\S]*filter/

    );

  }

);


test(

  "realtime cannot mutate reconciliation or active-session authority",

  () => {

    const genericStart =

      counter.indexOf(

        "const handleRealtime"

      );

    const paidStart =

      counter.indexOf(

        "const handlePaidRealtime",

        genericStart

      );

    const attachStart =

      counter.indexOf(

        "const attach",

        paidStart

      );

    assert.ok(

      genericStart >= 0 &&
      paidStart > genericStart &&
      attachStart > paidStart

    );

    const genericBody =

      counter.slice(

        genericStart,

        paidStart

      );

    const paidBody =

      counter.slice(

        paidStart,

        attachStart

      );

    /*
     * Generic Wallet POS realtime remains notification-only:
     * canonical HTTP readers refresh active session and alerts.
     */

    assert.match(

      genericBody,

      /loadCurrent/

    );

    assert.match(

      genericBody,

      /loadAlerts/

    );

    assert.doesNotMatch(

      genericBody,

      /payload(?:\?\.|\.)/

    );

    assert.doesNotMatch(

      genericBody,

      /setCurrent\s*\(/

    );

    assert.doesNotMatch(

      genericBody,

      /setAlerts\s*\(/

    );

    /*
     * Canonical post-settlement PAID may accelerate only the
     * terminal cashier receipt. It owns no active-session,
     * reconciliation, command, or financial authority.
     */

    assert.match(

      paidBody,

      /setLastPaidSession\s*\(/

    );

    assert.match(

      paidBody,

      /handleRealtime\s*\(\s*\)/

    );

    assert.doesNotMatch(

      paidBody,

      /setCurrent\s*\(/

    );

    assert.doesNotMatch(

      paidBody,

      /setAlerts\s*\(/

    );

    assert.doesNotMatch(

      paidBody,

      /resolveWalletPosAlert\s*\(/

    );

    assert.doesNotMatch(

      paidBody,

      /createWalletPosManualPayment\s*\(/

    );

    assert.doesNotMatch(

      paidBody,

      /cancelWalletPosManualSession\s*\(/

    );

  }

);


test(

  "Super Admin sees canonical mismatch evidence",

  () => {

    assert.match(

      counter,

      /difference_amount/

    );

    assert.match(

      counter,

      /last_detected_at[\s\S]*first_detected_at/

    );

    assert.match(

      counter,

      /Chênh lệch/

    );

    assert.match(

      counter,

      /Phát hiện/

    );

    assert.match(

      counter,

      /XÁC NHẬN QUYẾT ĐỊNH/

    );

  }

);
