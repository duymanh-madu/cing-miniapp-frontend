import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const TOKEN_KEY = "cing_admin_token";

export function useAdminAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      apiClient.get("/admin/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => setAdmin(r.data?.admin))
        .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); });
    }
  }, [token]);

  const login = async (username, password) => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.post("/admin/auth/login", { username, password });
      const t = res.data.token;
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      setAdmin(res.data.admin);
    } catch(e) {
      setError(e.response?.data?.message || "Đăng nhập thất bại");
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null); setAdmin(null);
  };

  return { token, admin, loading, error, login, logout, isAuth: !!token && !!admin };
}
