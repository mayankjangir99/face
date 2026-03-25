import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, BellRing, RefreshCw, ShieldAlert, SlidersHorizontal, UserCheck2 } from 'lucide-react';
import { apiClient } from '../api/client.js';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFaceRecognition } from '../hooks/useFaceRecognition.js';
import { playAlertTone, requestNotificationAccess, sendBrowserNotification, speakFeedback } from '../services/notifications.js';
import { connectSocket, disconnectSocket } from '../services/socket.js';
import { formatConfidence, formatDateTime, formatTime, getLocalDateKey } from '../utils/formatters.js';

const RecognitionPage = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [threshold, setThreshold] = useState(0.55);
  const [pageError, setPageError] = useState('');
  const [systemFeed, setSystemFeed] = useState([]);
  const [unknownAlerts, setUnknownAlerts] = useState([]);
  const [syncingContext, setSyncingContext] = useState(false);
  const pendingMarksRef = useRef(new Set());
  const todayKey = getLocalDateKey();
  const markedStudentIds = todayAttendance.map((entry) => entry.student?._id).filter(Boolean);

  const handleRecognition = async (match) => {
    if (pendingMarksRef.current.has(match.studentId)) {
      return;
    }

    pendingMarksRef.current.add(match.studentId);

    try {
      const { data } = await apiClient.post('/mark-attendance', {
        studentId: match.studentId,
        confidence: match.confidence,
        distance: match.distance,
        threshold,
        facesDetected: match.facesDetected,
        snapshotDataUrl: match.snapshotDataUrl
      });

      if (data.attendance) {
        setTodayAttendance((current) =>
          current.some((entry) => entry._id === data.attendance._id || entry.student?._id === match.studentId)
            ? current
            : [data.attendance, ...current]
        );
      }

      if (!data.duplicate) {
        setSystemFeed((current) =>
          [
            {
              id: crypto.randomUUID(),
              title: `Attendance marked for ${match.name}`,
              time: new Date().toISOString()
            },
            ...current
          ].slice(0, 6)
        );

        speakFeedback(`Attendance marked for ${match.name}`);
        sendBrowserNotification('Attendance marked', `${match.name} is now marked present.`);
      }
    } catch (requestError) {
      setPageError(requestError.response?.data?.message || 'Attendance could not be marked.');
    } finally {
      window.setTimeout(() => {
        pendingMarksRef.current.delete(match.studentId);
      }, 1800);
    }
  };

  const handleUnknown = (alert) => {
    const entry = {
      id: crypto.randomUUID(),
      time: alert.time,
      facesDetected: alert.facesDetected
    };

    setUnknownAlerts((current) => [entry, ...current].slice(0, 5));
    playAlertTone();
    sendBrowserNotification('Unknown face detected', `${alert.facesDetected} face(s) did not match a known profile.`);
  };

  const { videoRef, canvasRef, cameraReady, training, descriptorCount, liveDetections, statusMessage, error } =
    useFaceRecognition({
      students,
      threshold,
      markedStudentIds,
      onRecognized: handleRecognition,
      onUnknown: handleUnknown
    });
  const untrainedStudentsCount = Math.max(students.length - descriptorCount, 0);

  const loadRecognitionContext = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setSyncingContext(true);
      }

      setPageError('');

      const [studentResponse, attendanceResponse] = await Promise.all([
        apiClient.get('/students'),
        apiClient.get('/attendance', {
          params: {
            date: todayKey
          }
        })
      ]);

      setStudents(studentResponse.data.students.filter((student) => student.status === 'active'));
      setTodayAttendance(attendanceResponse.data.records);
    } catch (requestError) {
      setPageError(requestError.response?.data?.message || 'Unable to load recognition data.');
    } finally {
      if (!silent) {
        setSyncingContext(false);
      }
    }
  };

  useEffect(() => {
    loadRecognitionContext();
    requestNotificationAccess();
    const syncInterval = window.setInterval(() => {
      loadRecognitionContext({ silent: true });
    }, 15000);

    return () => {
      window.clearInterval(syncInterval);
    };
  }, [todayKey]);

  useEffect(() => {
    const socket = connectSocket(token);

    if (!socket) {
      return undefined;
    }

    const handleAttendanceMarked = (record) => {
      if (record.dateKey === todayKey) {
        setTodayAttendance((current) =>
          current.some((entry) => entry._id === record._id || entry.student?._id === record.student?._id)
            ? current
            : [record, ...current]
        );
      }
    };

    socket.on('attendance:marked', handleAttendanceMarked);

    return () => {
      socket.off('attendance:marked', handleAttendanceMarked);
      disconnectSocket();
    };
  }, [todayKey, token]);

  return (
    <div className="space-y-4">
      <section className="surface-panel">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Live Mode</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Real-time recognition console</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              The browser detects multiple faces, matches them against student profiles, and marks attendance once per
              day with a stored snapshot.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <button
              type="button"
              onClick={() => loadRecognitionContext()}
              disabled={syncingContext}
              className="soft-button rounded-2xl border border-slate-200 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
            >
              <RefreshCw className={`size-4 ${syncingContext ? 'animate-spin' : ''}`} />
              {syncingContext ? 'Refreshing...' : 'Refresh roster'}
            </button>

            <div className="flex items-center gap-3 rounded-3xl bg-slate-100/80 px-4 py-3 dark:bg-slate-950/70">
              <SlidersHorizontal className="size-4 text-slate-500" />
              <div className="w-56">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Match tolerance
                </label>
                <input
                  type="range"
                  min="0.35"
                  max="0.65"
                  step="0.01"
                  value={threshold}
                  onChange={(event) => setThreshold(Number(event.target.value))}
                  className="w-full accent-sky-500"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Higher values allow looser matches. Start near 0.55 for small photo sets.
                </p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white dark:bg-sky-500 dark:text-slate-950">
                {threshold.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {pageError || error ? (
          <p className="mt-5 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
            {pageError || error}
          </p>
        ) : null}

        {!training && students.length > 0 && descriptorCount === 0 ? (
          <p className="mt-5 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
            No student profile is ready for matching yet. Re-upload clear, front-facing student photos, then refresh this
            page or wait for the roster sync.
          </p>
        ) : null}

        {!training && descriptorCount > 0 && untrainedStudentsCount > 0 ? (
          <p className="mt-5 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
            {descriptorCount} of {students.length} active student profiles trained successfully. Re-upload clearer photos
            for the remaining students if they are not matching.
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Profiles ready" value={descriptorCount} hint="Students with usable training images." accent="sky" />
        <StatCard label="Today marked" value={todayAttendance.length} hint="Unique attendance entries for today." accent="emerald" />
        <StatCard label="Camera state" value={cameraReady ? 'Live' : 'Pending'} hint="Webcam stream and overlay status." accent="amber" />
        <StatCard label="Training state" value={training ? 'Encoding' : 'Ready'} hint={statusMessage} accent="violet" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="surface-panel overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-title">Camera feed</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{statusMessage}</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-950/70 dark:text-slate-300">
              Multi-face detection
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 dark:border-slate-800">
            <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full bg-slate-950 object-cover" />
            <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {liveDetections.length > 0 ? (
              liveDetections.map((detection, index) => (
                <div key={`${detection.studentId || 'unknown'}-${index}`} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{detection.known ? detection.name : 'Unknown face'}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        detection.known
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                      }`}
                    >
                      {detection.known ? 'Matched' : 'Alert'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Confidence: {formatConfidence(detection.confidence)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No faces currently detected in frame.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300">
                <UserCheck2 className="size-5" />
              </div>
              <div>
                <h2 className="section-title">Today’s attendance</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recognized students are listed instantly.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {todayAttendance.length > 0 ? (
                todayAttendance.slice(0, 8).map((entry) => (
                  <div key={entry._id} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{entry.name}</p>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>{entry.studentCode}</span>
                      <span>{formatTime(entry.attendedAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No attendance has been marked yet for {todayKey}.
                </div>
              )}
            </div>
          </div>

          <div className="surface-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-300">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <h2 className="section-title">Unknown face alerts</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Alerts are throttled to avoid kiosk noise.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {unknownAlerts.length > 0 ? (
                unknownAlerts.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-amber-600 dark:text-amber-300" />
                      <p className="font-semibold text-amber-700 dark:text-amber-200">Unknown face detected</p>
                    </div>
                    <p className="mt-2 text-sm text-amber-700/80 dark:text-amber-100/80">
                      {entry.facesDetected} face(s) unmatched at {formatDateTime(entry.time)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No unknown faces detected in the current session.
                </div>
              )}
            </div>
          </div>

          <div className="surface-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600 dark:text-sky-300">
                <BellRing className="size-5" />
              </div>
              <div>
                <h2 className="section-title">System feed</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recent voice and browser notification events.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {systemFeed.length > 0 ? (
                systemFeed.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                    <p className="font-semibold">{event.title}</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(event.time)}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Recognition events will appear here after the first successful match.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecognitionPage;
