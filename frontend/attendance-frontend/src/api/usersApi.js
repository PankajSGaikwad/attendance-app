import api from "./client";


export const getUsers = () =>
  api.get("/api/admin/users");


export const getUserById = (userId) =>
  api.get(`/api/admin/users/${userId}`);


export const createUser = (payload) =>
  api.post("/api/admin/users", payload);


export const updateUserStatus = (
  userId,
  status
) =>
  api.patch(
    `/api/admin/users/${userId}/status`,
    {
      status,
    }
  );


export const updateUserRoles = (
  userId,
  roles
) =>
  api.put(
    `/api/admin/users/${userId}/roles`,
    {
      roles,
    }
  );