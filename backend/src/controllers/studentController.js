import Student from '../models/Student.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { removeStoredFiles } from '../utils/fileUtils.js';
import { serializeStudent } from '../utils/serializers.js';

const getUploadedImagePaths = (files = []) =>
  files.map((file) => `uploads/students/${file.filename}`.replace(/\\/g, '/'));

const extractJsonArray = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return [];
  }
};

export const getStudents = asyncHandler(async (req, res) => {
  const { search = '', status = '' } = req.query;
  const query = {};

  if (search.trim()) {
    const pattern = new RegExp(search.trim(), 'i');
    query.$or = [{ name: pattern }, { studentCode: pattern }, { department: pattern }, { className: pattern }];
  }

  if (status) {
    query.status = status;
  }

  const students = await Student.find(query).sort({ createdAt: -1 });

  res.json({
    students: students.map((student) => serializeStudent(student, req))
  });
});

export const addStudent = asyncHandler(async (req, res) => {
  const { name, studentCode, department, className, email, phone, notes, status } = req.body;

  if (!name || !studentCode) {
    return res.status(400).json({ message: 'Student name and student code are required.' });
  }

  const existingStudent = await Student.findOne({ studentCode });

  if (existingStudent) {
    return res.status(409).json({ message: 'A student with this code already exists.' });
  }

  const student = await Student.create({
    name,
    studentCode,
    department,
    className,
    email,
    phone,
    notes,
    status: status || 'active',
    imagePaths: getUploadedImagePaths(req.files)
  });

  return res.status(201).json({
    message: 'Student added successfully.',
    student: serializeStudent(student, req)
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const replaceImages = req.body.replaceImages === 'true';
  const keepImages = extractJsonArray(req.body.keepImages);
  const keepImagesProvided = Object.prototype.hasOwnProperty.call(req.body, 'keepImages');
  const newImagePaths = getUploadedImagePaths(req.files);
  let finalImagePaths = student.imagePaths;

  if (replaceImages) {
    await removeStoredFiles(student.imagePaths);
    finalImagePaths = newImagePaths;
  } else if (keepImagesProvided || newImagePaths.length > 0) {
    const retainedPaths = keepImagesProvided
      ? student.imagePaths.filter((path) => keepImages.includes(path))
      : student.imagePaths;
    const removedPaths = keepImagesProvided
      ? student.imagePaths.filter((path) => !keepImages.includes(path))
      : [];

    await removeStoredFiles(removedPaths);
    finalImagePaths = [...retainedPaths, ...newImagePaths];
  }

  Object.assign(student, {
    name: req.body.name ?? student.name,
    studentCode: req.body.studentCode ?? student.studentCode,
    department: req.body.department ?? student.department,
    className: req.body.className ?? student.className,
    email: req.body.email ?? student.email,
    phone: req.body.phone ?? student.phone,
    notes: req.body.notes ?? student.notes,
    status: req.body.status ?? student.status,
    imagePaths: finalImagePaths
  });

  await student.save();

  return res.json({
    message: 'Student updated successfully.',
    student: serializeStudent(student, req)
  });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  await removeStoredFiles(student.imagePaths);
  await student.deleteOne();

  return res.json({
    message: 'Student deleted successfully.'
  });
});
