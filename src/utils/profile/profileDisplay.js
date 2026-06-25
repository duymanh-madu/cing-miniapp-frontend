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
    profile?.display_avatar ||
    profile?.avatar ||
    profile?.zalo_avatar ||
    fallback
  );
}
