import { create } from "zustand";

interface AuthRuntimeState {

  authenticated: boolean;

  accessToken: string | null;

  userId: string | null;

  role: string | null;

  setAuthenticated: (
    value: boolean
  ) => void;

  setAccessToken: (
    token: string | null
  ) => void;

  setUser: (
    payload: {
      userId: string | null;
      role: string | null;
    }
  ) => void;

}

export const useAuthRuntimeStore =
  create<AuthRuntimeState>(

    (
      set
    ) => ({

      authenticated: false,

      accessToken: null,

      userId: null,

      role: null,

      setAuthenticated: (
        value
      ) => set({

        authenticated:
          value,

      }),

      setAccessToken: (
        token
      ) => set({

        accessToken:
          token,

      }),

      setUser: (
        payload
      ) => set({

        userId:
          payload.userId,

        role:
          payload.role,

      }),

    })

  );