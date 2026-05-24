import {
  useAdmin,
} from "@/admin/providers/AdminProvider";

function useAdminSession() {

  const admin = useAdmin();

  return admin?.session;

}

export default useAdminSession;