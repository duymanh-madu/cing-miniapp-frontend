import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import adminAuthService from "@/admin/services/adminAuthService";

const AdminContext =
  createContext(null);

export function AdminProvider({
  children,
}) {

  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function bootstrap() {

      try {

        const currentSession =
          await adminAuthService.getSession();

        setSession(currentSession);

      } finally {

        setLoading(false);

      }

    }

    bootstrap();

  }, []);

  return (
    <AdminContext.Provider
      value={{
        session,
        setSession,
        loading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );

}

export function useAdmin() {

  return useContext(AdminContext);

}