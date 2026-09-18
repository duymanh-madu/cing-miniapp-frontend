import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks =
  vi.hoisted(() => ({
    post:
      vi.fn(),

    createSession:
      vi.fn(),

    getPersistedAuthSession:
      vi.fn(),
  }));

vi.mock(
  "../api/apiClient.js",
  () => ({
    default: {
      post:
        mocks.post,
    },
  })
);

vi.mock(
  "./authSession.js",
  () => ({
    createSession:
      mocks.createSession,
  })
);

vi.mock(
  "./persistedAuthSession.js",
  () => ({
    getPersistedAuthSession:
      mocks.getPersistedAuthSession,
  })
);

describe(
  "recoverBackendAuthSession",
  () => {
    beforeEach(() => {
      vi.resetModules();

      mocks.post.mockReset();
      mocks.createSession.mockReset();
      mocks.getPersistedAuthSession.mockReset();

      mocks.getPersistedAuthSession.mockReturnValue({
        session: {
          accessToken:
            "expired-access",

          refreshToken:
            "refresh-1",

          profile: {
            id:
              "customer-1",

            name:
              "Old name",

            localOnly:
              "preserved",
          },
        },

        accessToken:
          "expired-access",

        refreshToken:
          "refresh-1",
      });
    });

    it(
      "refreshes access token and atomically persists canonical session",
      async () => {
        mocks.post.mockResolvedValue({
          data: {
            success:
              true,

            data: {
              accessToken:
                "fresh-access",

              customer: {
                id:
                  "customer-1",

                name:
                  "Fresh name",
              },
            },
          },
        });

        const {
          recoverBackendAuthSession,
        } =
          await import(
            "./authRecovery.js"
          );

        const result =
          await recoverBackendAuthSession();

        expect(
          mocks.post
        ).toHaveBeenCalledTimes(1);

        expect(
          mocks.post
        ).toHaveBeenCalledWith(
          "/auth/refresh",
          {
            refreshToken:
              "refresh-1",
          }
        );

        expect(
          mocks.createSession
        ).toHaveBeenCalledTimes(1);

        expect(
          mocks.createSession
        ).toHaveBeenCalledWith({
          accessToken:
            "fresh-access",

          refreshToken:
            "refresh-1",

          profile: {
            id:
              "customer-1",

            name:
              "Fresh name",

            localOnly:
              "preserved",
          },
        });

        expect(
          result.accessToken
        ).toBe(
          "fresh-access"
        );

        expect(
          result.refreshToken
        ).toBe(
          "refresh-1"
        );
      }
    );

    it(
      "single-flights concurrent recovery",
      async () => {
        let resolveRefresh;

        mocks.post.mockImplementation(
          () =>
            new Promise(
              (resolve) => {
                resolveRefresh =
                  resolve;
              }
            )
        );

        const {
          recoverBackendAuthSession,
        } =
          await import(
            "./authRecovery.js"
          );

        const first =
          recoverBackendAuthSession();

        const second =
          recoverBackendAuthSession();

        expect(
          mocks.post
        ).toHaveBeenCalledTimes(1);

        resolveRefresh({
          data: {
            success:
              true,

            data: {
              accessToken:
                "fresh-access",

              customer: {
                id:
                  "customer-1",
              },
            },
          },
        });

        const [
          a,
          b,
        ] =
          await Promise.all([
            first,
            second,
          ]);

        expect(
          a.accessToken
        ).toBe(
          "fresh-access"
        );

        expect(
          b.accessToken
        ).toBe(
          "fresh-access"
        );

        expect(
          mocks.post
        ).toHaveBeenCalledTimes(1);

        expect(
          mocks.createSession
        ).toHaveBeenCalledTimes(1);
      }
    );

    it(
      "marks 400 401 403 refresh rejection as definitive",
      async () => {
        for (
          const status of [
            400,
            401,
            403,
          ]
        ) {
          vi.resetModules();

          mocks.post.mockReset();
          mocks.createSession.mockReset();

          const rejected =
            Object.assign(
              new Error(
                `rejected ${status}`
              ),
              {
                response: {
                  status,
                },
              }
            );

          mocks.post.mockRejectedValue(
            rejected
          );

          const {
            recoverBackendAuthSession,
            isDefinitiveAuthRecoveryRejection,
          } =
            await import(
              "./authRecovery.js"
            );

          await expect(
            recoverBackendAuthSession()
          ).rejects.toBe(
            rejected
          );

          expect(
            isDefinitiveAuthRecoveryRejection(
              rejected
            )
          ).toBe(true);

          expect(
            mocks.createSession
          ).not.toHaveBeenCalled();
        }
      }
    );

    it(
      "does not classify transient refresh failure as auth rejection",
      async () => {
        const transient =
          Object.assign(
            new Error(
              "backend unavailable"
            ),
            {
              response: {
                status:
                  503,
              },
            }
          );

        mocks.post.mockRejectedValue(
          transient
        );

        const {
          recoverBackendAuthSession,
          isDefinitiveAuthRecoveryRejection,
        } =
          await import(
            "./authRecovery.js"
          );

        await expect(
          recoverBackendAuthSession()
        ).rejects.toBe(
          transient
        );

        expect(
          isDefinitiveAuthRecoveryRejection(
            transient
          )
        ).toBe(false);

        expect(
          mocks.createSession
        ).not.toHaveBeenCalled();
      }
    );
  }
);
