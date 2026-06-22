function shellBridge<T>(requestType: string, resultType: string, timeout = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const requestId = `${requestType}_${Date.now()}`;
    const timer = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error(`__TIMEOUT__${requestType}`));
    }, timeout);
    function handler(e: MessageEvent) {
      const data = e.data;
      if (!data || data.type !== resultType) return;
      if (data.requestId && data.requestId !== requestId) return;
      clearTimeout(timer);
      window.removeEventListener("message", handler);
      resolve(data as T);
    }
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: requestType, requestId }, "*");
  });
}

export async function verifyOAFollowStatus(): Promise<boolean> {
  try {
    const result: any = await shellBridge("REQUEST_ZALO_FOLLOW_STATUS", "ZALO_FOLLOW_STATUS_RESULT");
    return !!result?.isFollowing;
  } catch {
    return false;
  }
}

export async function requestOAFollow(): Promise<boolean> {
  try {
    const result: any = await shellBridge("REQUEST_ZALO_FOLLOW_OA", "ZALO_FOLLOW_OA_RESULT", 30000);
    return !!result?.isFollowing;
  } catch {
    return false;
  }
}

export async function followOARuntime(): Promise<boolean> {
  return requestOAFollow();
}
