import api from "./client";

export const getShifts = (
  activeOnly = false
) =>
  api.get(
    "/api/shifts",
    {
      params: {
        activeOnly,
      },
    }
  );

export const getShiftById = (
  shiftId
) =>
  api.get(
    `/api/shifts/${shiftId}`
  );

export const createShift = (
  payload
) =>
  api.post(
    "/api/shifts",
    payload
  );

export const updateShift = (
  shiftId,
  payload
) =>
  api.put(
    `/api/shifts/${shiftId}`,
    payload
  );

export const activateShift = (
  shiftId
) =>
  api.patch(
    `/api/shifts/${shiftId}/activate`
  );

export const deactivateShift = (
  shiftId
) =>
  api.patch(
    `/api/shifts/${shiftId}/deactivate`
  );