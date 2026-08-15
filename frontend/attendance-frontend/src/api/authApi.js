import api from "./client";

export const login = (payload) =>
  api.post(
    "/api/auth/login",
    payload
  );

export const register = (payload) =>
  api.post(
    "/api/auth/register",
    payload
  );

export const logout = (refreshToken) =>
  api.post(
    "/api/auth/logout",
    {
      refreshToken,
    }
  );

export const refresh = (refreshToken) =>
  api.post(
    "/api/auth/refresh",
    {
      refreshToken,
    }
  );

export const me = () =>
  api.get("/api/auth/me");