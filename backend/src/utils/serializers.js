import { buildFileUrl } from './fileUtils.js';

export const serializeStudent = (student, req) => {
  const object = student.toObject ? student.toObject() : student;

  return {
    ...object,
    imageUrls: (object.imagePaths || []).map((imagePath) => buildFileUrl(req, imagePath))
  };
};

export const serializeAttendance = (attendance, req) => {
  const object = attendance.toObject ? attendance.toObject() : attendance;
  const populatedStudent = object.student
    ? object.student.toObject
      ? object.student.toObject()
      : object.student
    : null;

  return {
    ...object,
    snapshotUrl: buildFileUrl(req, object.snapshotPath),
    student: populatedStudent
      ? {
          ...populatedStudent,
          imageUrls: (populatedStudent.imagePaths || []).map((imagePath) => buildFileUrl(req, imagePath))
        }
      : null
  };
};
