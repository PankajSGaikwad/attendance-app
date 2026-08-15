import api from "./client";

/*
 * Get the currently effective shift for a department
 * on a specific date.
 *
 * GET
 * /api/shift-assignments/departments/{departmentId}/effective
 */
export const getEffectiveDepartmentShift = (
  departmentId,
  date
) =>
  api.get(
    `/api/shift-assignments/departments/${departmentId}/effective`,
    {
      params: {
        date,
      },
    }
  );


/*
 * Get assignment history for a department.
 *
 * GET
 * /api/shift-assignments/departments/{departmentId}/history
 */
export const getDepartmentShiftHistory = (
  departmentId
) =>
  api.get(
    `/api/shift-assignments/departments/${departmentId}/history`
  );


/*
 * Assign a shift to a department.
 *
 * PUT
 * /api/shift-assignments/departments/{departmentId}
 *
 * Body:
 * {
 *   shiftId: "...",
 *   effectiveFrom: "YYYY-MM-DD"
 * }
 */
export const assignDepartmentShift = (
  departmentId,
  payload
) =>
  api.put(
    `/api/shift-assignments/departments/${departmentId}`,
    payload
  );