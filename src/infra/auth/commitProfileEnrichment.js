import useAuthStore from "@/stores/auth";
import { getPersistedAuthSession } from "./persistedAuthSession.js";

function normalizePhone(value) {
  const digits = String(value || "").replace(/\\D/g, "");
  return digits.startsWith("84")
    ? "0" + digits.slice(2)
    : digits;
}

export function commitProfileEnrichment({
  expectedCustomerId,
  expectedPhone,
  expectedRefreshToken,
  profile,
}) {
  const auth = useAuthStore.getState();
  const persisted = getPersistedAuthSession();

  const phone = normalizePhone(expectedPhone);
  const currentPhone = normalizePhone(auth.profile?.phone);

  if (
    !auth.authenticated ||
    !auth.accessToken ||
    !auth.refreshToken ||
    !expectedRefreshToken ||
    !phone ||
    currentPhone !== phone ||
    String(auth.profile?.id || "") !==
      String(expectedCustomerId || "") ||
    auth.refreshToken !== expectedRefreshToken ||
    persisted.accessToken !== auth.accessToken ||
    persisted.refreshToken !== auth.refreshToken
  ) {
    return false;
  }

  const nextProfile = {
    ...(auth.profile || {}),
    ...(profile || {}),
    id: auth.profile.id,
    phone: auth.profile.phone,
  };

  try {
    localStorage.setItem(
      "cing_session",
      JSON.stringify({
        ...(persisted.session || {}),
        accessToken: persisted.accessToken,
        refreshToken: persisted.refreshToken,
        profile: nextProfile,
      })
    );
  } catch {
    return false;
  }

  auth.updateProfile(nextProfile);
  return true;
}
