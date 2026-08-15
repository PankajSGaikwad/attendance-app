import api from "./client";

export const getMyProfile = () =>
  api.get("/api/employees/me");

export const createMyProfile = (payload) =>
  api.post(
    "/api/employees/profile",
    payload
  );

export const updateMyProfile = (payload) =>
  api.put(
    "/api/employees/me",
    payload
  );

export const submitMyProfile = () =>
  api.patch(
    "/api/employees/me/submit"
  );

export const getMyQr = () =>
  api.get(
    "/api/employees/me/qr",
    {
      responseType: "blob",
    }
  );