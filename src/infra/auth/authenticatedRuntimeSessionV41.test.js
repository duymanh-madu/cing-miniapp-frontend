import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  persisted: vi.fn(),
  recover: vi.fn(),
  rejected: vi.fn(),
  deviceId: vi.fn(),
  createSession: vi.fn(),
}));

vi.mock("@/infra/api/apiClient", () => ({
  default: {
    post: mocks.post,
  },
}));

vi.mock("@/infra/auth/persistedAuthSession", () => ({
  getPersistedAuthSession: mocks.persisted,
}));

vi.mock("@/infra/auth/authRecovery", () => ({
  recoverBackendAuthSession: mocks.recover,
  isDefinitiveAuthRecoveryRejection:
    mocks.rejected,
}));

vi.mock("@/runtime/session/runtimeDeviceIdentity", () => ({
  getOrCreateRuntimeDeviceId:
    mocks.deviceId,
}));

vi.mock("@/infra/auth/authSession", () => ({
  createSession: mocks.createSession,
}));

const customer = {
  id: "customer-41",
  phone: "84912345678",
  name: "Backend member",
};

function opened(value = customer) {
  return {
    data: {
      success: true,
      data: {
        customer: value,
      },
    },
  };
}

async function runSession() {
  const session = await import(
    "./authenticatedRuntimeSession.ts"
  );

  return {
    result:
      await session.openAuthenticatedRuntimeSession(),
    diagnostic:
      session.getAuthenticatedRuntimeSessionDiagnostic(),
  };
}

describe(
  "V41 backend-verified profile hydration",
  () => {
    beforeEach(() => {
      vi.resetModules();

      Object.values(mocks).forEach(
        (mock) => mock.mockReset()
      );

      mocks.deviceId.mockReturnValue(
        "installation-41"
      );

      mocks.rejected.mockImplementation(
        (error) =>
          Boolean(error?.authRejected)
      );

      mocks.persisted.mockReturnValue({
        accessToken: "access-41",
        refreshToken: "refresh-41",
        session: {
          profile: {
            id: "stale-id",
            phone: "",
            avatar: "saved-avatar",
          },
        },
      });
    });

    it(
      "restores backend identity when existing JWT is accepted",
      async () => {
        mocks.post.mockResolvedValue(
          opened()
        );

        const { result } =
          await runSession();

        expect(result).toBe(
          "authenticated"
        );

        expect(
          mocks.createSession
        ).toHaveBeenCalledExactlyOnceWith({
          accessToken: "access-41",
          refreshToken: "refresh-41",
          profile:
            expect.objectContaining({
              id: "customer-41",
              phone: "0912345678",
              name: "Backend member",
            }),
        });

        expect(
          mocks.post
        ).toHaveBeenCalledTimes(1);

        expect(
          mocks.createSession.mock.calls[0][0]
            .profile
        ).not.toHaveProperty(
          "avatar"
        );
      }
    );

    it(
      "preserves display profile for the same verified customer",
      async () => {
        mocks.persisted.mockReturnValue({
          accessToken: "access-41",
          refreshToken: "refresh-41",
          session: {
            profile: {
              id: "customer-41",
              phone: "0912345678",
              avatar: "same-member-avatar",
            },
          },
        });

        mocks.post.mockResolvedValue(
          opened()
        );

        const { result } =
          await runSession();

        expect(result).toBe(
          "authenticated"
        );

        expect(
          mocks.createSession.mock.calls[0][0]
            .profile.avatar
        ).toBe(
          "same-member-avatar"
        );
      }
    );

    it(
      "rejects stale display profile when customer phone differs",
      async () => {
        mocks.persisted.mockReturnValue({
          accessToken: "access-41",
          refreshToken: "refresh-41",
          session: {
            profile: {
              id: "customer-41",
              phone: "0900000000",
              avatar: "other-phone-avatar",
            },
          },
        });

        mocks.post.mockResolvedValue(
          opened()
        );

        const { result } =
          await runSession();

        expect(result).toBe(
          "authenticated"
        );

        expect(
          mocks.createSession.mock.calls[0][0]
            .profile
        ).not.toHaveProperty(
          "avatar"
        );
      }
    );

    it(
      "restores backend identity after refresh",
      async () => {
        mocks.persisted.mockReturnValue({
          accessToken: null,
          refreshToken: "refresh-41",
          session: {
            profile: {
              phone: "",
            },
          },
        });

        mocks.recover.mockImplementation(
          async () => {
            mocks.persisted.mockReturnValue({
              accessToken: "fresh-41",
              refreshToken: "refresh-41",
              session: {
                profile: {
                  phone: "",
                },
              },
            });

            return {
              accessToken: "fresh-41",
            };
          }
        );

        mocks.post.mockResolvedValue(
          opened()
        );

        const { result } =
          await runSession();

        expect(result).toBe(
          "authenticated"
        );

        expect(
          mocks.recover
        ).toHaveBeenCalledTimes(1);

        expect(
          mocks.createSession
        ).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({
            accessToken: "fresh-41",
            refreshToken: "refresh-41",
            profile:
              expect.objectContaining({
                id: "customer-41",
                phone: "0912345678",
              }),
          })
        );
      }
    );

    it(
      "does not restore a logged-out session after a late response",
      async () => {
        let finishOpen;

        mocks.post.mockImplementation(
          () => new Promise((resolve) => {
            finishOpen = resolve;
          })
        );

        const pending = runSession();

        await vi.waitFor(() => {
          expect(
            mocks.post
          ).toHaveBeenCalledTimes(1);
        });

        mocks.persisted.mockReturnValue({
          accessToken: null,
          refreshToken: null,
          session: null,
        });

        finishOpen(opened());

        const {
          result,
          diagnostic,
        } = await pending;

        expect(result).toBe(
          "transient_failure"
        );

        expect(diagnostic).toContain(
          "AUTH_SESSION_SUPERSEDED"
        );

        expect(
          mocks.createSession
        ).not.toHaveBeenCalled();

        expect(
          mocks.recover
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "does not overwrite a newer account after a late response",
      async () => {
        let finishOpen;

        mocks.post.mockImplementation(
          () => new Promise((resolve) => {
            finishOpen = resolve;
          })
        );

        const pending = runSession();

        await vi.waitFor(() => {
          expect(
            mocks.post
          ).toHaveBeenCalledTimes(1);
        });

        mocks.persisted.mockReturnValue({
          accessToken: "account-b-access",
          refreshToken: "account-b-refresh",
          session: {
            profile: {
              id: "account-b",
              phone: "0900000000",
            },
          },
        });

        finishOpen(opened());

        const {
          result,
          diagnostic,
        } = await pending;

        expect(result).toBe(
          "transient_failure"
        );

        expect(diagnostic).toContain(
          "AUTH_SESSION_SUPERSEDED"
        );

        expect(
          mocks.createSession
        ).not.toHaveBeenCalled();

        expect(
          mocks.recover
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "does not hydrate from a response missing customer phone",
      async () => {
        mocks.post.mockResolvedValue(
          opened({
            id: "customer-41",
            phone: "",
          })
        );

        const {
          result,
          diagnostic,
        } = await runSession();

        expect(result).toBe(
          "transient_failure"
        );

        expect(diagnostic).toContain(
          "AUTH_SESSION_CUSTOMER_MISSING"
        );

        expect(
          mocks.createSession
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "preserves credentials on transient session-open failure",
      async () => {
        mocks.post.mockRejectedValue({
          response: {
            status: 503,
          },
        });

        const { result } =
          await runSession();

        expect(result).toBe(
          "transient_failure"
        );

        expect(
          mocks.createSession
        ).not.toHaveBeenCalled();

        expect(
          mocks.recover
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "does not hydrate rejected JWT without refresh token",
      async () => {
        mocks.persisted.mockReturnValue({
          accessToken: "expired-41",
          refreshToken: null,
          session: null,
        });

        mocks.post.mockRejectedValue({
          response: {
            status: 401,
          },
        });

        const { result } =
          await runSession();

        expect(result).toBe(
          "auth_rejected"
        );

        expect(
          mocks.createSession
        ).not.toHaveBeenCalled();
      }
    );
  }
);
