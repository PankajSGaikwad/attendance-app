import api from "./client";


export const getEmployees = (
  status
) => {

  if (status) {

    return api.get(
      "/api/admin/employees",
      {
        params: {
          status,
        },
      }
    );
  }


  return api.get(
    "/api/admin/employees"
  );
};


export const getEmployeeById = (
  employeeId
) => {

  return api.get(
    `/api/admin/employees/${employeeId}`
  );
};


export const approveEmployee = (
  employeeId
) => {

  return api.patch(
    `/api/admin/employees/${employeeId}/approve`
  );
};


export const rejectEmployee = (
  employeeId,
  reason
) => {

  return api.patch(
    `/api/admin/employees/${employeeId}/reject`,
    {
      reason,
    }
  );
};


export const getEmployeeQr = (
  employeeId
) => {

  return api.get(
    `/api/admin/employees/${employeeId}/qr`,
    {
      responseType: "blob",
    }
  );
};