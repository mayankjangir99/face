import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

export const getBootstrapStatus = asyncHandler(async (_req, res) => {
  const userCount = await User.countDocuments();

  res.json({
    requiresBootstrap: userCount === 0
  });
});

export const bootstrapAdmin = asyncHandler(async (req, res) => {
  const existingUsers = await User.countDocuments();

  if (existingUsers > 0) {
    return res.status(400).json({ message: 'Bootstrap is disabled because users already exist.' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'admin'
  });

  const token = createToken(user);

  return res.status(201).json({
    message: 'Admin account created successfully.',
    token,
    user
  });
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'teacher' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  return res.status(201).json({
    message: 'User account created successfully.',
    user
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = createToken(user);

  return res.json({
    token,
    user: user.toJSON()
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
