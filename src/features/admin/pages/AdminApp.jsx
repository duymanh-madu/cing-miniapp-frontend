import { useState } from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import AdminLogin from "../components/AdminLogin";
import AdminDashboard from "../components/AdminDashboard";

export default function AdminApp() {
  const auth = useAdminAuth();
  if (!auth.isAuth) return <AdminLogin auth={auth} />;
  return <AdminDashboard auth={auth} />;
}
