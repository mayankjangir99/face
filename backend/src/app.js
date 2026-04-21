import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { backendRoot } from './config/paths.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());
const allowAnyOrigin = allowedOrigins.includes('*');

app.use(
  cors({
    origin: allowAnyOrigin ? true : allowedOrigins,
    credentials: true
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(`${backendRoot}/uploads`));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'face-recognition-attendance-backend'
  });
});

app.use(authRoutes);
app.use(studentRoutes);
app.use(attendanceRoutes);
app.use('/api', authRoutes);
app.use('/api', studentRoutes);
app.use('/api', attendanceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
