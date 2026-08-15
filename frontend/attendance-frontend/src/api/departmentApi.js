import api from "./client";

export const getDepartmentOptions = () =>
  api.get("/api/departments/options");

export const getDesignationOptions = (
  departmentId
) =>
  api.get(
    `/api/departments/${departmentId}/designations/options`
  );