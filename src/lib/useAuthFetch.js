"use client";

import { fetchAuthSession } from "aws-amplify/auth";

export function useAuthFetch() {
  return async (url, options = {}) => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let response = await fetch(url, { ...headers, ...options });

    if (response.status === 401) {
      try {
        const session = await fetchAuthSession({ forceRefresh: true });
        if (!session.tokens) {
          throw new Error("No tokens available");
        }
        response = await fetch(url, { ...headers, ...options });
      } catch (refreshError) {
        window.location.href = `/login?redirect=${window.location.pathname}`;
        return new Response(JSON.stringify({ error: "Session expired" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return response;
  };
}
