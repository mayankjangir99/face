# Face Recognition Attendance System

A full-stack attendance platform built with:

- React + Vite + Tailwind CSS
- `face-api.js` for browser-side face detection and recognition
- Node.js + Express + Socket.IO
- MongoDB + Mongoose
- JWT authentication with admin/teacher roles

## Implemented Features

- Real-time webcam access and multi-face detection
- Browser-side recognition using labeled student images
- Bounding boxes with names and confidence scores
- Attendance marking with duplicate prevention per day
- MongoDB attendance storage
- Snapshot capture when attendance is marked
- Attendance search and date filtering
- Attendance analytics charts
- CSV and PDF export
- Dark mode and responsive UI
- Admin student management with image upload
- Teacher/admin login with JWT auth
- Unknown face alerts with browser notification and sound
- Voice feedback for successful attendance
- Real-time attendance updates through WebSockets

## Project Structure

```text
face-recognition-attendance-system/
├── backend/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── uploads/
├── frontend/
│   ├── public/models/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── utils/
└── README.md
```

## Prerequisites

- Node.js 20+ recommended
- MongoDB running locally or a reachable MongoDB URI
- Webcam access in the browser
- `face-api.js` model files copied into `frontend/public/models`

## Environment Setup

Create these files:

- `backend/.env`
- `frontend/.env`

Use the examples already included:

### `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/face-recognition-attendance
JWT_SECRET=replace-with-a-secure-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
APP_TIMEZONE=Asia/Kolkata
ADMIN_SEED_NAME=System Admin
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=Admin@123
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_FACE_API_MODEL_URL=/models
```

## Required face-api.js Models

Copy these files into [frontend/public/models](/c:/Users/mayan/OneDrive/Desktop/face%20recognize/frontend/public/models):

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

## Install Dependencies

PowerShell on this machine blocks `npm.ps1`, so use `npm.cmd` if plain `npm` fails.

```powershell
npm.cmd install
```

Because the root project uses npm workspaces, that single install covers both `frontend` and `backend`.

## Run the App

Start both frontend and backend from the root folder:

```powershell
npm.cmd run dev
```

Frontend:

- `http://localhost:5173`

Backend:

- `http://localhost:5000`

## Admin Bootstrap

You have two options:

1. Open the login screen and create the first admin through the bootstrap form if the database has no users.
2. Seed an admin from the terminal:

```powershell
npm.cmd run seed --workspace backend
```

## Main API Endpoints

Authentication:

- `POST /auth/login`
- `GET /auth/me`
- `GET /auth/bootstrap-status`
- `POST /auth/bootstrap`
- `POST /auth/register`

Students:

- `GET /students`
- `POST /add-student`
- `PUT /students/:id`
- `DELETE /delete-student/:id`

Attendance:

- `POST /mark-attendance`
- `GET /attendance`
- `GET /attendance/export/csv`
- `GET /attendance/export/pdf`
- `GET /analytics/overview`

## Typical Usage Flow

1. Start MongoDB.
2. Install dependencies with `npm.cmd install`.
3. Add the face-api model files to `frontend/public/models`.
4. Run `npm.cmd run dev`.
5. Create the first admin account on the login screen.
6. Add students and upload clear training images.
7. Open the recognition page and allow webcam access.
8. Watch live detections, unknown-face alerts, voice feedback, and dashboard updates.

## Notes

- Recognition quality depends heavily on uploaded student photos and lighting conditions.
- Attendance duplicate prevention is enforced in MongoDB with a unique index on `student + dateKey`.
- Student images and attendance snapshots are stored in `backend/uploads`.
- Liveness detection / mask detection is not included in this version and can be added as a separate model pipeline later.
