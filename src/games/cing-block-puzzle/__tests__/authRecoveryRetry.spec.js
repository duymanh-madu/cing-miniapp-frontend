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

    recover:
      vi.fn(),

    token:
      vi.fn(),
  }));

vi.mock(
  "../../../infra/api/apiClient.js",
  () => ({
    default: {
      post:
        mocks.post,
    },
  })
);

vi.mock(
  "../../../infra/auth/authRecovery.js",
  () => ({
    recoverBackendAuthSession:
      mocks.recover,
  })
);

vi.mock(
  "../../../infra/auth/persistedAuthSession.js",
  () => ({
    getCanonicalAccessToken:
      mocks.token,
  })
);

describe(
  "Block Puzzle authenticated request recovery",
  () => {
    beforeEach(() => {
      vi.resetModules();

      mocks.post.mockReset();
      mocks.recover.mockReset();
      mocks.token.mockReset();

      mocks.token
        .mockReturnValueOnce(
          "expired-access"
        )
        .mockReturnValue(
          "fresh-access"
        );

      mocks.recover.mockResolvedValue({
        accessToken:
          "fresh-access",
      });
    });

    it(
      "retries start once with the exact same request_id",
      async () => {
        const requestId =
          "123e4567-e89b-42d3-a456-426614174000";

        const sessionId =
          "123e4567-e89b-42d3-a456-426614174001";

        mocks.post
          .mockRejectedValueOnce(
            Object.assign(
              new Error(
                "expired"
              ),
              {
                response: {
                  status:
                    401,
                },
              }
            )
          )
          .mockResolvedValueOnce({
            data: {
              success:
                true,

              data: {
                session_id:
                  sessionId,

                request_id:
                  requestId,

                seed:
                  1,

                engine_version:
                  1,

                rules_version:
                  1,

                score_version:
                  1,

                replay_version:
                  1,

                started_at:
                  "2026-09-16T00:00:00.000Z",

                expires_at:
                  "2026-09-16T01:00:00.000Z",

                play_cost:
                  1,

                idempotent:
                  false,
              },
            },
          });

        const {
          startAuthorizedBlockPuzzleSession,
        } =
          await import(
            "../runtime/blockPuzzleAuthorityClient.js"
          );

        await startAuthorizedBlockPuzzleSession({
          requestId,
        });

        expect(
          mocks.recover
        ).toHaveBeenCalledTimes(1);

        expect(
          mocks.post
        ).toHaveBeenCalledTimes(2);

        expect(
          mocks.post.mock.calls[0][1]
        ).toEqual({
          request_id:
            requestId,
        });

        expect(
          mocks.post.mock.calls[1][1]
        ).toEqual({
          request_id:
            requestId,
        });

        expect(
          mocks.post.mock.calls[0][2]
            .headers.Authorization
        ).toBe(
          "Bearer expired-access"
        );

        expect(
          mocks.post.mock.calls[1][2]
            .headers.Authorization
        ).toBe(
          "Bearer fresh-access"
        );
      }
    );

    it(
      "stops after one recovery if retry is also 401",
      async () => {
        const requestId =
          "123e4567-e89b-42d3-a456-426614174010";

        mocks.post.mockRejectedValue(
          Object.assign(
            new Error(
              "unauthorized"
            ),
            {
              response: {
                status:
                  401,
              },
            }
          )
        );

        const {
          startAuthorizedBlockPuzzleSession,
        } =
          await import(
            "../runtime/blockPuzzleAuthorityClient.js"
          );

        await expect(
          startAuthorizedBlockPuzzleSession({
            requestId,
          })
        ).rejects.toMatchObject({
          response: {
            status:
              401,
          },
        });

        expect(
          mocks.recover
        ).toHaveBeenCalledTimes(1);

        expect(
          mocks.post
        ).toHaveBeenCalledTimes(2);
      }
    );

    it(
      "does not recover a non-401 failure",
      async () => {
        const requestId =
          "123e4567-e89b-42d3-a456-426614174020";

        mocks.post.mockRejectedValue(
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
          )
        );

        const {
          startAuthorizedBlockPuzzleSession,
        } =
          await import(
            "../runtime/blockPuzzleAuthorityClient.js"
          );

        await expect(
          startAuthorizedBlockPuzzleSession({
            requestId,
          })
        ).rejects.toMatchObject({
          response: {
            status:
              503,
          },
        });

        expect(
          mocks.recover
        ).not.toHaveBeenCalled();

        expect(
          mocks.post
        ).toHaveBeenCalledTimes(1);
      }
    );
  }
);
