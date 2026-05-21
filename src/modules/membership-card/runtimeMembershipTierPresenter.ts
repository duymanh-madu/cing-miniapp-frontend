export function presentMembershipTier(
  tier:
    string,
) {

  const map:
    Record<string, string> = {

    hoi_vien:
      "Hội viên",

    hoi_vien_than_thiet:
      "Hội viên thân thiết",

    hoi_vien_bac:
      "Hội viên bạc",

    hoi_vien_vang:
      "Hội viên vàng",

    hoi_vien_kim_cuong:
      "Hội viên kim cương",

    doi_tac:
      "Đối tác",

    doi_tac_than_thiet:
      "Đối tác thân thiết",

  };

  return map[tier] || tier;

}