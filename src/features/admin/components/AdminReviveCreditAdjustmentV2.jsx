import {
  useEffect,
  useRef,
  useState,
} from "react";

import apiClient from "@/infra/api/apiClient";

/*
 * CING GAME CENTER V2
 *
 * Admin adjustment is a financial operation.
 *
 * This UI never updates balance directly.
 * PostgreSQL owns the mutation and audit ledger.
 *
 * V2 OFF: AdminGames retains the V1 controls.
 */

const MAX_AMOUNT = 2147483647;
const REQUEST_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PENDING_STORAGE_VERSION = 1;
const PENDING_STORAGE_PREFIX =
  "cing:admin:revive-adjustment:v2:";

function actorStorageKey(adminId) {
  if (
    typeof adminId !== "string" ||
    !adminId.trim() ||
    adminId.length > 128
  ) {
    throw new Error("Thiếu danh tính Admin đã xác minh.");
  }
  return PENDING_STORAGE_PREFIX + encodeURIComponent(adminId);
}

function assertStoredPayload(payload) {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    Object.keys(payload).sort().join(",") !==
      "amount,note,reason_code,request_id,user_id" ||
    typeof payload.user_id !== "string" ||
    typeof payload.reason_code !== "string" ||
    typeof payload.note !== "string" ||
    typeof payload.request_id !== "string" ||
    !REQUEST_UUID.test(payload.request_id)
  ) {
    throw new Error("Dữ liệu giao dịch đang chờ không hợp lệ. Không gửi giao dịch mới.");
  }
  const direction = payload.amount > 0 ? "credit" : "debit";
  const validated = validatePayload({
    userId: payload.user_id,
    amount: String(Math.abs(payload.amount)),
    direction,
    reason: payload.reason_code,
    note: payload.note,
  });
  if (
    !Number.isSafeInteger(payload.amount) ||
    payload.amount === 0 ||
    validated.amount !== payload.amount ||
    validated.user_id !== payload.user_id ||
    validated.reason_code !== payload.reason_code ||
    validated.note !== payload.note
  ) {
    throw new Error("Dữ liệu giao dịch đang chờ bị sai lệch. Không gửi giao dịch mới.");
  }
  return payload;
}

function storageForAdmin(adminId) {
  const key = actorStorageKey(adminId);
  // sessionStorage survives reload within this tab, not a general shared-device ledger.
  // Do not persist credentials or trust any restored record as financial authority.
  const storage = window.sessionStorage;
  if (!storage) throw new Error("Không có bộ nhớ an toàn cho yêu cầu chờ.");
  return { storage, key };
}

function readPending(adminId) {
  const { storage, key } = storageForAdmin(adminId);
  const raw = storage.getItem(key);
  if (raw == null) return null;
  let record;
  try { record = JSON.parse(raw); }
  catch { throw new Error("Không đọc được yêu cầu đang chờ. Đã khóa giao dịch mới."); }
  if (
    record?.version !== PENDING_STORAGE_VERSION ||
    record.admin_id !== adminId
  ) {
    throw new Error("Yêu cầu đang chờ không thuộc Admin hiện tại.");
  }
  return assertStoredPayload(record.payload);
}

function persistPending(adminId, payload) {
  assertStoredPayload(payload);
  const { storage, key } = storageForAdmin(adminId);
  if (storage.getItem(key) !== null) {
    throw new Error("Đã có yêu cầu chưa đối soát. Không tạo UUID mới.");
  }
  const raw = JSON.stringify({
    version: PENDING_STORAGE_VERSION,
    admin_id: adminId,
    payload,
  });
  storage.setItem(key, raw);
  if (storage.getItem(key) !== raw) {
    throw new Error("Không xác minh được yêu cầu đã lưu. Không gửi giao dịch.");
  }
}

function clearPending(adminId, requestId) {
  const { storage, key } = storageForAdmin(adminId);
  const current = readPending(adminId);
  if (!current || current.request_id !== requestId) {
    throw new Error("Yêu cầu đang chờ đã thay đổi; cần đối soát thủ công.");
  }
  storage.removeItem(key);
  if (storage.getItem(key) !== null) {
    throw new Error("Không xóa được yêu cầu đã xử lý. Chưa thể tạo giao dịch mới.");
  }
}

function verifyHistoricalStatus(result, payload) {
  if (
    result?.request_id !== payload.request_id ||
    !["found", "not_found"].includes(result?.status)
  ) {
    throw new Error("Phản hồi trạng thái không khớp yêu cầu đang chờ.");
  }
  if (result.status === "found") {
    if (
      result.user_id !== payload.user_id ||
      result.amount !== payload.amount ||
      result.reason_code !== payload.reason_code ||
      typeof result.transaction_id !== "string" ||
      !/^[1-9][0-9]*$/.test(result.transaction_id) ||
      !Number.isSafeInteger(result.balance_after) ||
      result.balance_after < 0
    ) {
      throw new Error("Lịch sử giao dịch không khớp payload; cần đối soát thủ công.");
    }
  }
  return result;
}


const REASON_CODE =
  /^[a-z0-9][a-z0-9_]{1,63}$/;

const panel = {
  background: "#1a1a24",
  border: "1px solid #D4531C",
  borderRadius: 14,
  padding: 20,
  marginBottom: 20,
  color: "#f8eee4",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#2a2a38",
  border: "1px solid #555",
  borderRadius: 8,
  padding: "10px 12px",
  color: "white",
  fontSize: 14,
  marginTop: 6,
};

function createRequestId() {
  if (
    typeof crypto === "undefined" ||
    typeof crypto.randomUUID !== "function"
  ) {
    throw new Error(
      "Thiết bị không hỗ trợ mã giao dịch an toàn."
    );
  }

  return crypto.randomUUID();
}

function validatePayload({
  userId,
  amount,
  direction,
  reason,
  note,
}) {
  const user =
    String(userId).trim();

  if (
    !user ||
    user.length > 200
  ) {
    throw new Error(
      "Số điện thoại hoặc mã khách hàng không hợp lệ."
    );
  }

  const amountText =
    String(amount).trim();

  if (
    !/^[1-9][0-9]*$/.test(
      amountText
    )
  ) {
    throw new Error(
      "Số Credit phải là số nguyên dương."
    );
  }

  const quantity =
    Number(amountText);

  if (
    !Number.isSafeInteger(
      quantity
    ) ||
    quantity > MAX_AMOUNT
  ) {
    throw new Error(
      "Số Credit vượt giới hạn cho phép."
    );
  }

  if (
    direction !== "credit" &&
    direction !== "debit"
  ) {
    throw new Error(
      "Chiều điều chỉnh không hợp lệ."
    );
  }

  const reasonCode =
    String(reason).trim();

  if (
    !REASON_CODE.test(
      reasonCode
    )
  ) {
    throw new Error(
      "Mã lý do phải dùng chữ thường, số hoặc dấu gạch dưới."
    );
  }

  const normalizedNote =
    String(note).trim();

  if (
    !normalizedNote ||
    normalizedNote.length > 500
  ) {
    throw new Error(
      "Ghi chú bắt buộc, tối đa 500 ký tự."
    );
  }

  return {
    user_id: user,
    amount:
      direction === "credit"
        ? quantity
        : -quantity,
    reason_code:
      reasonCode,
    note:
      normalizedNote,
  };
}

export default function AdminReviveCreditAdjustmentV2({
  token,
  role,
  adminId,
}) {
  const [userId, setUserId] =
    useState("");

  const [amount, setAmount] =
    useState("1");

  const [direction, setDirection] =
    useState("credit");

  const [reason, setReason] =
    useState("admin_manual_adjustment");

  const [note, setNote] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* Always recover before enabling a new financial POST. */
  const pendingRef = useRef(null);
  const busyRef = useRef(false);
  const epochRef = useRef(0);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    const epoch = ++epochRef.current;
    const current = () => epochRef.current === epoch;
    pendingRef.current = null;
    setPending(false);
    setReady(false);
    setTransactionId("");
    setError("");
    setMessage("");

    if (role !== "super_admin" || !token || !adminId) {
      return () => { epochRef.current++; };
    }

    async function recover() {
      try {
        const saved = readPending(adminId);
        if (!current()) return;
        pendingRef.current = saved;
        setPending(Boolean(saved));
        if (!saved) {
          setReady(true);
          return;
        }
        setUserId(saved.user_id);
        setAmount(String(Math.abs(saved.amount)));
        setDirection(saved.amount > 0 ? "credit" : "debit");
        setReason(saved.reason_code);
        setNote(saved.note);
        setReady(true);
        setChecking(true);
        const response = await apiClient.get(
          `/admin/revive-credits/adjust/status/${saved.request_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!current()) return;
        if (response.data?.success !== true) {
          throw new Error("Không xác minh được trạng thái giao dịch.");
        }
        const status = verifyHistoricalStatus(response.data.data, saved);
        if (status.status === "found") {
          clearPending(adminId, saved.request_id);
          if (!current()) return;
          pendingRef.current = null;
          setPending(false);
          setTransactionId(status.transaction_id);
          setMessage(
            `Đã ghi nhận giao dịch #${status.transaction_id}. ` +
            `Số dư lịch sử: ${status.balance_after} Credit.`
          );
        } else {
          setMessage(
            "Chưa thấy giao dịch trong lịch sử. POST cũ vẫn có thể hoàn tất muộn; " +
            "chỉ được thử lại cùng UUID và payload."
          );
        }
      } catch (err) {
        if (current()) {
          setError(err.message || "Không khôi phục được yêu cầu.");
          // Storage failure remains fail-closed. Network status failure keeps
          // the same pending UUID and permits only exact-idempotent retry.
        }
      } finally {
        if (current()) setChecking(false);
      }
    }
    recover();
    return () => { epochRef.current++; };
  }, [adminId, role, token]);

  if (role !== "super_admin") return null;

  const editLocked = busy || pending || checking || !ready;

  async function checkStatus() {
    if (busyRef.current || !ready || !pendingRef.current) return;
    const payload = pendingRef.current;
    const epoch = epochRef.current;
    busyRef.current = true;
    setChecking(true);
    setError("");
    try {
      const response = await apiClient.get(
        `/admin/revive-credits/adjust/status/${payload.request_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (epochRef.current !== epoch) return;
      if (response.data?.success !== true) {
        throw new Error("Không xác minh được trạng thái giao dịch.");
      }
      const result = verifyHistoricalStatus(response.data.data, payload);
      if (result.status === "found") {
        clearPending(adminId, payload.request_id);
        if (epochRef.current !== epoch) return;
        pendingRef.current = null;
        setPending(false);
        setTransactionId(result.transaction_id);
        setMessage(
          `Đã ghi nhận giao dịch #${result.transaction_id}. ` +
          `Số dư lịch sử: ${result.balance_after} Credit.`
        );
      } else {
        setMessage("Chưa thấy kết quả; vẫn giữ nguyên UUID và payload.");
      }
    } catch (err) {
      if (epochRef.current === epoch) {
        setError(err.message || "Không tra cứu được trạng thái.");
      }
    } finally {
      busyRef.current = false;
      if (epochRef.current === epoch) setChecking(false);
    }
  }

  async function submit() {
    if (busyRef.current || checking || !ready || !token || !adminId) return;
    const epoch = epochRef.current;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let payload = pendingRef.current;
      if (!payload) {
        const validated = validatePayload({
          userId, amount, direction, reason, note,
        });
        payload = { ...validated, request_id: createRequestId() };
        // Durable verified write MUST precede the first financial HTTP POST.
        persistPending(adminId, payload);
        if (epochRef.current !== epoch) return;
        pendingRef.current = payload;
        setPending(true);
      }
      // A retry uses exactly the original user, amount, reason, note and UUID.
      const response = await apiClient.post(
        "/admin/revive-credits/adjust",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (epochRef.current !== epoch) return;
      const result = response.data?.data;
      if (
        response.data?.success !== true ||
        !result || typeof result.applied !== "boolean" ||
        result.transaction_id == null ||
        !Number.isSafeInteger(result.balance_after) ||
        result.balance_after < 0
      ) {
        throw new Error("Chưa xác minh được giao dịch. Thử lại cùng mã.");
      }
      clearPending(adminId, payload.request_id);
      if (epochRef.current !== epoch) return;
      pendingRef.current = null;
      setPending(false);
      setTransactionId(String(result.transaction_id));
      setMessage(
        `${result.applied ? "Đã điều chỉnh" : "Yêu cầu đã ghi nhận"}. ` +
        `Mã giao dịch: ${result.transaction_id}. Số dư: ${result.balance_after} Credit.`
      );
      setNote("");
    } catch (err) {
      if (epochRef.current === epoch) {
        setError(
          err.response?.data?.code || err.message || "Chưa xác minh được giao dịch."
        );
      }
    } finally {
      busyRef.current = false;
      if (epochRef.current === epoch) setBusy(false);
    }
  }

  return (
    <section style={panel}>
      <h3
        style={{
          marginTop: 0,
          color: "#ffac66",
        }}
      >
        🫧 Điều chỉnh Revive Credit
      </h3>

      <p
        style={{
          color: "#baa898",
          fontSize: 12,
        }}
      >
        Chỉ Super Admin. Mọi thay đổi
        được ghi nhận bằng giao dịch
        tài chính và lịch sử kiểm toán.
      </p>

      <label>
        Số điện thoại / mã khách hàng

        <input
          style={inputStyle}
          value={userId}
          onChange={e =>
            setUserId(
              e.target.value
            )
          }
          disabled={editLocked}
          autoComplete="off"
        />
      </label>

      <label
        style={{
          display: "block",
          marginTop: 14,
        }}
      >
        Hình thức điều chỉnh

        <select
          style={inputStyle}
          value={direction}
          onChange={e =>
            setDirection(
              e.target.value
            )
          }
          disabled={editLocked}
        >
          <option value="credit">
            Cộng Credit
          </option>

          <option value="debit">
            Trừ Credit
          </option>
        </select>
      </label>

      <label
        style={{
          display: "block",
          marginTop: 14,
        }}
      >
        Số Credit

        <input
          style={inputStyle}
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={e =>
            setAmount(
              e.target.value
            )
          }
          disabled={editLocked}
        />
      </label>

      <label
        style={{
          display: "block",
          marginTop: 14,
        }}
      >
        Mã lý do

        <input
          style={inputStyle}
          value={reason}
          onChange={e =>
            setReason(
              e.target.value
            )
          }
          disabled={editLocked}
          maxLength={64}
        />
      </label>

      <label
        style={{
          display: "block",
          marginTop: 14,
        }}
      >
        Ghi chú bắt buộc

        <textarea
          style={{
            ...inputStyle,
            minHeight: 76,
          }}
          value={note}
          onChange={e =>
            setNote(
              e.target.value
            )
          }
          disabled={editLocked}
          maxLength={500}
        />
      </label>

      {error && (
        <p
          role="alert"
          style={{
            color: "#ff8888",
          }}
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          style={{
            color: "#90df9d",
          }}
        >
          {message}
        </p>
      )}

      {pending && (
        <p
          style={{
            color: "#ffd28e",
            fontSize: 12,
          }}
        >
          Yêu cầu đang chờ xác minh.
          Không tạo giao dịch mới khi
          chưa xác định kết quả cũ.
        </p>
      )}

      {transactionId && <p role="status">Mã giao dịch: {transactionId}</p>}

      {pending && (
        <button
          type="button"
          onClick={checkStatus}
          disabled={busy || checking || !ready}
          style={{ marginTop: 12, marginRight: 8 }}
        >
          {checking ? "Đang đối soát..." : "Kiểm tra trạng thái PostgreSQL"}
        </button>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={
          busy || checking || !ready || !token || !adminId
        }
        style={{
          marginTop: 12,
          background: "#D4531C",
          color: "white",
          border: 0,
          borderRadius: 8,
          padding: "12px 16px",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        {busy
          ? "Đang xác minh..."
          : pending
            ? "Thử lại cùng mã giao dịch"
            : "Xác nhận điều chỉnh Credit"}
      </button>
    </section>
  );
}
