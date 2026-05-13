/**
 * ============================================
 * MOCK AUTH SERVICE
 * ============================================
 */

export async function loginGuest() {
  return {
    success: true,

    token:
      "guest-token",

    user: {
      id: "guest_001",

      name:
        "Duy Mạnh",

      avatar: "🧋",

      tier:
        "Diamond",

      points: 1250,
    },
  };
}