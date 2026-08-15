import api from "./client";

/*
 * Get designations belonging to a department.
 *
 * GET:
 * /api/departments/{departmentId}/designations
 */
export const getDesignationsByDepartment = (
  departmentId,
  activeOnly = false
) =>
  api.get(
    `/api/departments/${departmentId}/designations`,
    {
      params: {
        activeOnly,
      },
    }
  );


/*
 * Get one designation.
 *
 * GET:
 * /api/designations/{designationId}
 */
export const getDesignationById = (
  designationId
) =>
  api.get(
    `/api/designations/${designationId}`
  );


/*
 * Create designation.
 *
 * POST:
 * /api/departments/{departmentId}/designations
 *
 * Body:
 * {
 *   code: "DEV",
 *   name: "Developer"
 * }
 */
export const createDesignation = (
  departmentId,
  payload
) =>
  api.post(
    `/api/departments/${departmentId}/designations`,
    payload
  );


/*
 * Update designation.
 *
 * IMPORTANT:
 * Backend accepts ONLY name.
 *
 * PUT:
 * /api/designations/{designationId}
 *
 * Body:
 * {
 *   name: "Senior Developer"
 * }
 */
export const updateDesignation = (
  designationId,
  payload
) =>
  api.put(
    `/api/designations/${designationId}`,
    payload
  );


/*
 * Activate designation.
 */
export const activateDesignation = (
  designationId
) =>
  api.patch(
    `/api/designations/${designationId}/activate`
  );


/*
 * Deactivate designation.
 */
export const deactivateDesignation = (
  designationId
) =>
  api.patch(
    `/api/designations/${designationId}/deactivate`
  );