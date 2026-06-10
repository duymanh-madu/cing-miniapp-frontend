export function resolveProfileName(profile, fallback = "Cing iu") {
  return (
    profile?.display_name ||
    profile?.displayName ||
    profile?.zalo_name ||
    profile?.name ||
    profile?.fullName ||
    fallback
  );
}

export function resolveProfileAvatar(profile, fallback = "") {
  return (
    profile?.avatar ||
    profile?.display_avatar ||
    profile?.zalo_avatar ||
    fallback
  );
}
