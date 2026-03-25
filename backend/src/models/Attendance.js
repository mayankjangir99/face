import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    studentCode: {
      type: String,
      required: true,
      trim: true
    },
    dateKey: {
      type: String,
      required: true,
      index: true
    },
    attendedAt: {
      type: Date,
      default: Date.now
    },
    confidence: {
      type: Number,
      default: 0
    },
    snapshotPath: {
      type: String,
      default: ''
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recognitionMeta: {
      distance: {
        type: Number,
        default: 0
      },
      threshold: {
        type: Number,
        default: 0.45
      },
      source: {
        type: String,
        default: 'face-api.js'
      },
      facesDetected: {
        type: Number,
        default: 1
      }
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ student: 1, dateKey: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
