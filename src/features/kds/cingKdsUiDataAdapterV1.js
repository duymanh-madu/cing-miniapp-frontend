"use strict";

/*
 * Presentation contract adapter, not an authorization layer.
 *
 * Inputs must be returned by server-authenticated KDS APIs.
 * Never treat client-side validation as branch authorization.
 *
 * Cup transitions stay disabled until the backend supplies
 * an authoritative version and an approved mutation endpoint.
 */

function normalizeBranch(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    typeof value.pos_parent !== "string" ||
    !value.pos_parent.trim()
  ) {
    throw new Error("KDS_UI_BRANCH_INVALID");
  }

  const parent = value.pos_parent;
  const id = String(value.pos_id ?? "");

  if (
    parent !== parent.trim() ||
    !/^[1-9]\d*$/.test(id) ||
    !Number.isSafeInteger(Number(id))
  ) {
    throw new Error("KDS_UI_BRANCH_INVALID");
  }

  return {
    pos_parent: parent,
    pos_id: id
  };
}

function sameBranch(a, b) {
  const left = normalizeBranch(a);
  const right = normalizeBranch(b);

  return (
    left.pos_parent === right.pos_parent &&
    left.pos_id === right.pos_id
  );
}

function unwrapResponse(response, branch) {
  if (
    !response ||
    response.success !== true ||
    !Array.isArray(response.data) ||
    !sameBranch(response.branch, branch)
  ) {
    throw new Error("KDS_UI_RESPONSE_INVALID");
  }

  return response.data;
}

function normalizeCup(cup, allowedStatuses) {
  if (!cup || typeof cup !== "object") {
    throw new Error("KDS_UI_CUP_INVALID");
  }

  const cupId = String(cup.cup_id ?? "");
  const orderId = String(cup.order_id ?? "");

  if (
    !cupId ||
    !orderId ||
    !allowedStatuses.includes(cup.status)
  ) {
    throw new Error("KDS_UI_CUP_INVALID");
  }

  const elapsed = Number(cup.elapsed_minutes);

  if (
    !Number.isFinite(elapsed) ||
    elapsed < 0
  ) {
    throw new Error("KDS_UI_ELAPSED_INVALID");
  }

  if (
    !["normal", "warning", "critical"]
      .includes(cup.severity)
  ) {
    throw new Error("KDS_UI_SEVERITY_INVALID");
  }

  const version = cup.version;

  // Missing version is permitted for display only.
  // Any mutation requires a separately verified
  // server-supported version contract.
  const validVersion =
    typeof version === "number" &&
    Number.isSafeInteger(version) &&
    version >= 0;

  return {
    cup_id: cupId,
    order_id: orderId,
    tran_no: String(cup.tran_no ?? ""),
    item_name: String(cup.item_name ?? ""),
    item_group:
      String(cup.item_group || "Chưa phân nhóm"),
    status: cup.status,
    elapsed_minutes: elapsed,
    severity: cup.severity,
    version: validVersion ? version : null,
    transition_ready: false
  };
}

function normalizeArray(items, statuses) {
  return items.map(item => normalizeCup(item, statuses));
}

function groupCountsFor(preparation, serving) {
  const counts = new Map();

  for (const cup of [...preparation, ...serving]) {
    const group = cup.item_group;

    counts.set(group, (counts.get(group) || 0) + 1);
  }

  return [...counts]
    .sort(([a], [b]) => a.localeCompare(b, "vi"))
    .map(([item_group, total_unserved]) => ({
      item_group,
      total_unserved
    }));
}

function buildKdsUiSnapshot({
  branch,
  ordersResponse,
  servingResponse,
  alertsResponse = null,
  performanceResponse = null
}) {
  const authorizedBranch = normalizeBranch(branch);

  const preparation = normalizeArray(
    unwrapResponse(ordersResponse, authorizedBranch),
    ["pending", "preparing"]
  );

  const serving = normalizeArray(
    unwrapResponse(servingResponse, authorizedBranch),
    ["prepared"]
  );

  const identifiers = new Set();

  for (const cup of [...preparation, ...serving]) {
    if (identifiers.has(cup.cup_id)) {
      throw new Error("KDS_UI_DUPLICATE_CUP");
    }

    identifiers.add(cup.cup_id);
  }

  const alerts = alertsResponse === null
    ? []
    : unwrapResponse(alertsResponse, authorizedBranch);

  const performance = performanceResponse === null
    ? []
    : unwrapResponse(performanceResponse, authorizedBranch);

  return {
    branch: authorizedBranch,
    preparation,
    serving,
    groupCounts: groupCountsFor(preparation, serving),
    alerts,
    performance,
    transitionsEnabled: false
  };
}

export {
  normalizeBranch,
  sameBranch,
  buildKdsUiSnapshot
};
