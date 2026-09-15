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

function cancelBlock() {
  const start =
    counter.indexOf(
      "const cancelCurrentSession ="
    );

  assert.notEqual(
    start,
    -1
  );

  const end =
    counter.indexOf(
      "\n\n  useEffect(",
      start
    );

  assert.notEqual(
    end,
    -1
  );

  return counter.slice(
    start,
    end
  );
}

test(
  "cancel owns a dedicated command identity",
  () => {
    assert.match(
      counter,
      /const cancelRequestIdRef\s*=\s*useRef\(null\)/
    );

    const block =
      cancelBlock();

    assert.match(
      block,
      /cancelRequestIdRef\.current/
    );

    assert.match(
      block,
      /createRequestId\(\)/
    );

    assert.doesNotMatch(
      block,
      /requestId:\s*requestIdRef\.current/
    );
  }
);

test(
  "same cancel command identity survives transport failure for retry",
  () => {
    const block =
      cancelBlock();

    const reusePos =
      block.indexOf(
        "cancelRequestIdRef.current ||"
      );

    const createPos =
      block.indexOf(
        "createRequestId()",
        reusePos
      );

    const persistPos =
      block.indexOf(
        "cancelRequestIdRef.current =\n            cancelRequestId",
        createPos
      );

    const requestPos =
      block.indexOf(
        "await cancelWalletPosManualSession",
        persistPos
      );

    const successPos =
      block.indexOf(
        "result?.session_status !==",
        requestPos
      );

    const clearPos =
      block.indexOf(
        "cancelRequestIdRef.current =\n            null",
        successPos
      );

    const catchPos =
      block.indexOf(
        "} catch (",
        successPos
      );

    for (
      const [
        name,
        position,
      ] of Object.entries({
        reusePos,
        createPos,
        persistPos,
        requestPos,
        successPos,
        clearPos,
        catchPos,
      })
    ) {
      assert.notEqual(
        position,
        -1,
        "missing cancel retry invariant: " +
          name
      );
    }

    assert.ok(
      reusePos <
        createPos &&
      createPos <
        persistPos &&
      persistPos <
        requestPos &&
      requestPos <
        successPos &&
      successPos <
        clearPos &&
      clearPos <
        catchPos
    );

    const catchBlock =
      block.slice(
        catchPos
      );

    assert.equal(
      catchBlock.includes(
        "cancelRequestIdRef.current =\n            null"
      ),
      false
    );

    assert.equal(
      block.includes(
        "requestId:\n                  requestIdRef.current"
      ),
      false
    );
  }
);

test(
  "cancel identity clears after canonical cancelled success",
  () => {
    const block =
      cancelBlock();

    const successCheck =
      block.indexOf(
        'result?.session_status !=='
      );

    const reset =
      block.indexOf(
        "cancelRequestIdRef.current =",
        successCheck
      );

    assert.ok(
      successCheck >= 0
    );

    assert.ok(
      reset > successCheck
    );
  }
);

test(
  "cancel identity is fenced to session identity",
  () => {
    assert.match(
      counter,
      /cancel-command-session-fence-v1[\s\S]*cancelRequestIdRef\.current\s*=[\s\S]*null[\s\S]*current\?\.id/
    );
  }
);

test(
  "payment creation identity remains separate",
  () => {
    assert.match(
      counter,
      /const requestIdRef\s*=\s*useRef\(null\)/
    );

    assert.match(
      counter,
      /const cancelRequestIdRef\s*=\s*useRef\(null\)/
    );
  }
);
