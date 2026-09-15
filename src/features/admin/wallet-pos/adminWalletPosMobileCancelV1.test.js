import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root =
  process.cwd();

const counter =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/AdminWalletPosCounter.jsx"
    ),
    "utf8"
  );

const api =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/adminWalletPosApi.js"
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/admin-wallet-pos.css"
    ),
    "utf8"
  );

test(
  "cancel API is command-only backend authority",
  () => {
    assert.match(
      api,
      /manual-session\/\$\{encodeURIComponent\([\s\S]*\}\/cancel/
    );

    assert.match(
      api,
      /request_id:[\s\S]*requestId/
    );

    assert.match(
      api,
      /reason/
    );

    const start =
      api.indexOf(
        "cancelWalletPosManualSession"
      );

    assert.notEqual(
      start,
      -1
    );

    const tail =
      api.slice(start);

    const nextExport =
      tail.indexOf(
        "\nexport ",
        10
      );

    const block =
      nextExport === -1
        ? tail
        : tail.slice(
            0,
            nextExport
          );

    for (
      const forbidden
      of [
        "pos_parent",
        "pos_id",
        "store_id",
        "amount:",
      ]
    ) {
      assert.equal(
        block.includes(
          forbidden
        ),
        false,
        `browser authority leak: ${forbidden}`
      );
    }
  }
);

test(
  "cancel is exposed only for amount_frozen and qr_ready",
  () => {
    const start =
      counter.indexOf(
        "const canCancelCurrent ="
      );

    const end =
      counter.indexOf(
        "const cancelCurrentSession =",
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

    const block =
      counter.slice(
        start,
        end
      );

    assert.match(
      block,
      /"amount_frozen"/
    );

    assert.match(
      block,
      /"qr_ready"/
    );

    for (
      const forbidden
      of [
        '"paid"',
        '"reconciliation_pending"',
        '"reconciled"',
        '"reconciliation_mismatch"',
      ]
    ) {
      assert.equal(
        block.includes(
          forbidden
        ),
        false,
        `forbidden cancellable state: ${forbidden}`
      );
    }

    assert.match(
      counter,
      /HỦY PHIÊN THANH TOÁN/
    );
  }
);

test(
  "cancel owns sticky UUID separate from payment creation identity",
  () => {
    const refDeclaration =
      counter.indexOf(
        "cancelRequestIdRef"
      );

    const handlerStart =
      counter.indexOf(
        "const cancelCurrentSession ="
      );

    const handlerEnd =
      counter.indexOf(
        "\n  useEffect(",
        handlerStart
      );

    assert.notEqual(
      refDeclaration,
      -1
    );

    assert.notEqual(
      handlerStart,
      -1
    );

    assert.notEqual(
      handlerEnd,
      -1
    );

    const handler =
      counter.slice(
        handlerStart,
        handlerEnd
      );

    assert.match(
      handler,
      /cancelRequestIdRef\.current/
    );

    assert.match(
      handler,
      /createRequestId\(\)/
    );

    assert.match(
      handler,
      /requestId:\s*cancelRequestId/
    );

    assert.doesNotMatch(
      handler,
      /requestId:\s*requestIdRef\.current/
    );
  }
);

test(
  "sticky cancel UUID is cleared only after canonical success path",
  () => {
    const start =
      counter.indexOf(
        "const cancelCurrentSession ="
      );

    const end =
      counter.indexOf(
        "\n  useEffect(",
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

    const block =
      counter.slice(
        start,
        end
      );

    const successCheck =
      block.indexOf(
        'result?.session_status !=='
      );

    const successBoundary =
      block.indexOf(
        "paidLatchRef.current ="
      );

    const catchPos =
      block.indexOf(
        "} catch ("
      );

    assert.notEqual(
      successCheck,
      -1
    );

    assert.notEqual(
      successBoundary,
      -1
    );

    assert.notEqual(
      catchPos,
      -1
    );

    assert.ok(
      successBoundary > successCheck,
      "canonical cancelled validation must precede success mutations"
    );

    const successBlock =
      block.slice(
        successBoundary,
        catchPos
      );

    assert.match(
      successBlock,
      /cancelRequestIdRef\.current\s*=\s*null/
    );

    assert.match(
      successBlock,
      /cancelSessionIdRef\.current\s*=\s*null/
    );

    const catchBlock =
      block.slice(
        catchPos
      );

    assert.doesNotMatch(
      catchBlock,
      /cancelRequestIdRef\.current\s*=\s*null/
    );

    assert.doesNotMatch(
      catchBlock,
      /cancelSessionIdRef\.current\s*=\s*null/
    );
  }
);

test(
  "frontend cancel has no financial or economy authority",
  () => {
    const start =
      counter.indexOf(
        "const cancelCurrentSession ="
      );

    const end =
      counter.indexOf(
        "\n  useEffect(",
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

    const block =
      counter.slice(
        start,
        end
      );

    for (
      const forbidden
      of [
        "supabase",
        "updateMemberPoint",
        "addPoints",
        "wallet_balance",
        "loyalty",
        "spending",
        "refund",
        "event11",
      ]
    ) {
      assert.equal(
        block
          .toLowerCase()
          .includes(
            forbidden.toLowerCase()
          ),
        false,
        `forbidden authority: ${forbidden}`
      );
    }
  }
);

test(
  "mobile summary defaults collapsed and workspace can use full width",
  () => {
    assert.match(
      counter,
      /mobileSummaryOpen,[\s\S]*useState\(false\)/
    );

    assert.match(
      counter,
      /Mở tổng quan/
    );

    assert.match(
      counter,
      /Thu gọn tổng quan/
    );

    assert.match(
      css,
      /CING PAY MOBILE FOCUS V1/
    );

    assert.match(
      css,
      /cing-pay-counter__summary\.is-collapsed/
    );

    assert.match(
      css,
      /cing-pay-counter__keypad[\s\S]*max-width:\s*none/
    );
  }
);
