import assert from "node:assert/strict";
import test from "node:test";

function createWalletRequestAuthority({
  enabled = true,
  initialAuthResolved = false,
  authenticated = false,
} = {}) {
  let requests = 0;

  const state = {
    enabled,
    initialAuthResolved,
    authenticated,
  };

  const ready =
    () =>
      state.enabled &&
      state.initialAuthResolved &&
      state.authenticated;

  const transition =
    next => {
      const wasReady =
        ready();

      Object.assign(
        state,
        next
      );

      const isReady =
        ready();

      if (
        !wasReady &&
        isReady
      ) {
        requests += 1;
      }
    };

  const walletEvent =
    () => {
      if (!ready()) {
        return;
      }

      requests += 1;
    };

  return {
    ready,
    transition,
    walletEvent,
    requestCount:
      () => requests,
  };
}

test(
  "cold Home cannot request Wallet before auth is resolved",
  () => {
    const authority =
      createWalletRequestAuthority();

    assert.equal(
      authority.ready(),
      false
    );

    assert.equal(
      authority.requestCount(),
      0
    );

    authority.walletEvent();

    assert.equal(
      authority.requestCount(),
      0
    );
  }
);

test(
  "resolved authenticated transition releases exactly one initial Wallet request",
  () => {
    const authority =
      createWalletRequestAuthority();

    authority.transition({
      initialAuthResolved:
        true,
    });

    assert.equal(
      authority.requestCount(),
      0
    );

    authority.transition({
      authenticated:
        true,
    });

    assert.equal(
      authority.ready(),
      true
    );

    assert.equal(
      authority.requestCount(),
      1
    );
  }
);

test(
  "stable authenticated rerender does not manufacture another initial request",
  () => {
    const authority =
      createWalletRequestAuthority();

    authority.transition({
      initialAuthResolved:
        true,
      authenticated:
        true,
    });

    assert.equal(
      authority.requestCount(),
      1
    );

    authority.transition({
      initialAuthResolved:
        true,
      authenticated:
        true,
    });

    assert.equal(
      authority.requestCount(),
      1
    );
  }
);

test(
  "Wallet lifecycle refresh remains active after authentication",
  () => {
    const authority =
      createWalletRequestAuthority();

    authority.transition({
      initialAuthResolved:
        true,
      authenticated:
        true,
    });

    authority.walletEvent();

    assert.equal(
      authority.requestCount(),
      2
    );
  }
);

test(
  "resolved unauthenticated state never releases Wallet request",
  () => {
    const authority =
      createWalletRequestAuthority();

    authority.transition({
      initialAuthResolved:
        true,
      authenticated:
        false,
    });

    authority.walletEvent();

    assert.equal(
      authority.ready(),
      false
    );

    assert.equal(
      authority.requestCount(),
      0
    );
  }
);
