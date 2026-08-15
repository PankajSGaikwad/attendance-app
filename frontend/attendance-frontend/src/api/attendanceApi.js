import api from "./client";

export const getMyAttendance = () =>
  api.get("/api/attendance/me");

export const startAttendanceScan = (payload) =>
  api.post(
    "/api/attendance/scan/start",
    payload
  );

export const completeAttendanceScan = (payload) =>
  api.post(
    "/api/attendance/scan/complete",
    payload
  );