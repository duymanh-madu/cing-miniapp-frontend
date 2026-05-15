import {
  getAccessToken,
} from "@/auth/authStorage";

export function createHttpHeaders(
  headers = {}
) {

  const accessToken =
    getAccessToken();

  return {

    "Content-Type":
      "application/json",

    ...headers,

    ...(accessToken && {

      Authorization:
        `Bearer ${accessToken}`,

    }),

  };

}