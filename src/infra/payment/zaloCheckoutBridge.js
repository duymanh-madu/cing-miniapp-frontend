import {
  CheckoutSDK,
} from "zmp-sdk/apis";

export function requestZaloCheckoutFromShell(
  order
) {
  if (
    window.parent &&
    window.parent !== window
  ) {
    return new Promise(
      (
        resolve,
        reject
      ) => {
        const requestId =
          `checkout_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}`;

        const timer =
          setTimeout(
            () => {
              window.removeEventListener(
                "message",
                onMessage
              );

              reject(
                new Error(
                  "Zalo Checkout timeout"
                )
              );
            },
            90000
          );

        function onMessage(
          event
        ) {
          const data =
            event.data || {};

          if (
            data.type !==
              "ZALO_CHECKOUT_RESULT" ||
            data.requestId !==
              requestId
          ) {
            return;
          }

          clearTimeout(
            timer
          );

          window.removeEventListener(
            "message",
            onMessage
          );

          if (data.ok) {
            resolve(
              data.data
            );

            return;
          }

          reject(
            data.error ||
              new Error(
                "Zalo Checkout failed"
              )
          );
        }

        window.addEventListener(
          "message",
          onMessage
        );

        window.parent.postMessage(
          {
            type:
              "ZALO_CHECKOUT_CREATE_ORDER",

            requestId,

            order,
          },
          "*"
        );
      }
    );
  }

  return CheckoutSDK.createOrder(
    order
  );
}
