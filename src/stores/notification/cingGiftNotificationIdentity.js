/*
 * CING GAME CENTER V2
 * Gift notification presentation identity.
 *
 * This module never establishes financial authority.
 * Gift receipt, Charm and funding remain backend-owned.
 */

export function isCingGameGiftNotification(notification) {
  const metadata =
    notification?.metadata ||
    notification?.data ||
    {};

  return (
    notification?.type === "gift_received" &&
    metadata?.source === "cing_game_gift_purchase_v1"
  );
}

export function sameCingGameGiftNotification(left, right) {
  if (
    !isCingGameGiftNotification(left) ||
    !isCingGameGiftNotification(right)
  ) {
    return false;
  }

  const leftMetadata =
    left.metadata || left.data || {};

  const rightMetadata =
    right.metadata || right.data || {};

  const leftPurchase =
    leftMetadata.gift_purchase_id;

  const rightPurchase =
    rightMetadata.gift_purchase_id;

  if (
    leftPurchase &&
    rightPurchase &&
    String(leftPurchase) === String(rightPurchase)
  ) {
    return true;
  }

  return Boolean(
    left.id != null &&
    right.id != null &&
    String(left.id) === String(right.id)
  );
}

export function addGiftNotificationOnce(existing, incoming) {
  const current = Array.isArray(existing)
    ? existing
    : [];

  if (!isCingGameGiftNotification(incoming)) {
    return {
      notifications: [incoming, ...current].slice(0, 50),
      added: true,
    };
  }

  const index = current.findIndex(
    item => sameCingGameGiftNotification(item, incoming)
  );

  if (index < 0) {
    return {
      notifications: [incoming, ...current].slice(0, 50),
      added: true,
    };
  }

  const previous = current[index];

  const merged = {
    ...previous,
    ...incoming,
    id: incoming.id ?? previous.id,
    metadata:
      incoming.metadata ??
      previous.metadata,
    data:
      incoming.data ??
      previous.data,
    read: Boolean(
      previous.read ||
      previous.is_read ||
      incoming.read ||
      incoming.is_read
    ),
    is_read: Boolean(
      previous.is_read ||
      incoming.is_read
    ),
  };

  return {
    notifications: current.map(
      (item, position) =>
        position === index ? merged : item
    ),
    added: false,
  };
}

export function deduplicateGiftNotifications(notifications) {
  const output = [];

  for (const notification of notifications || []) {
    const duplicateIndex =
      isCingGameGiftNotification(notification)
        ? output.findIndex(existing =>
            sameCingGameGiftNotification(
              existing,
              notification
            )
          )
        : -1;

    if (duplicateIndex < 0) {
      output.push(notification);
      continue;
    }

    const previous = output[duplicateIndex];

    output[duplicateIndex] = {
      ...previous,
      id: previous.id ?? notification.id,
      metadata:
        previous.metadata ??
        notification.metadata,
      data:
        previous.data ??
        notification.data,
      read: Boolean(
        previous.read ||
        previous.is_read ||
        notification.read ||
        notification.is_read
      ),
      is_read: Boolean(
        previous.is_read ||
        notification.is_read
      ),
    };
  }

  return output.slice(0, 50);
}
