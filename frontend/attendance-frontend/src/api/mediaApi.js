import api from "./client";

export const uploadAttendancePhoto = (
  attemptId,
  completionToken,
  photoFile
) => {
  const formData = new FormData();

  formData.append("attemptId", attemptId);
  formData.append("completionToken", completionToken);
  formData.append("photo", photoFile);

  return api.post(
    "/api/media/employee/attendance-photo",
    formData
  );
};

export const getMediaMetadata = (mediaId) =>
  api.get(`/api/media/employee/${mediaId}`);

export const getMediaContent = (mediaId) =>
  api.get(`/api/media/employee/${mediaId}/content`, {
    responseType: "blob",
  });