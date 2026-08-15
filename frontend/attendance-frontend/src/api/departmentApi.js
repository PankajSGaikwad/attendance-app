import api from "./client";

export const getDepartments = (
  activeOnly = false
) =>
  api.get(
    "/api/departments",
    {
      params: {
        activeOnly,
      },
    }
  );

export const getDepartmentById = (
  departmentId
) =>
  api.get(
    `/api/departments/${departmentId}`
  );

export const createDepartment = (
  payload
) =>
  api.post(
    "/api/departments",
    payload
  );

export const updateDepartment = (
  departmentId,
  payload
) =>
  api.put(
    `/api/departments/${departmentId}`,
    payload
  );

export const activateDepartment = (
  departmentId
) =>
  api.patch(
    `/api/departments/${departmentId}/activate`
  );

export const deactivateDepartment = (
  departmentId
) =>
  api.patch(
    `/api/departments/${departmentId}/deactivate`
  );