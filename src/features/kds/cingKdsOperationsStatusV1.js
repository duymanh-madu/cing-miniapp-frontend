const holds = {
  KDS_OPS_READ_DISABLED: "Chi nhánh chưa mở dữ liệu vận hành. Đang chờ hoàn tất xác minh nguồn và kích hoạt KDS.",
  KDS_OPS_POLICY_REQUIRED: "Super Admin cần lưu ngưỡng SLA trước khi mở dữ liệu vận hành."
};

export function kdsOperationsStatusV1(code) {
  if (Object.hasOwn(holds, code)) return {hold:true,message:holds[code]};
  const errors = {
    KDS_OPS_FORBIDDEN:"Tài khoản chưa có quyền vận hành chi nhánh này.",
    KDS_OPS_UNAUTHORIZED:"Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại."
  };
  return {hold:false,message:errors[code] || "Không thể đồng bộ dữ liệu KDS. Thao tác đã tạm khóa; hệ thống sẽ thử kết nối lại."};
}
