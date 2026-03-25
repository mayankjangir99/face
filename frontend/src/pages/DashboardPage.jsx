import { useEffect, useState } from 'react';
import { Download, FileText, RefreshCcw } from 'lucide-react';
import { apiClient } from '../api/client.js';
import AttendanceTable from '../components/AttendanceTable.jsx';
import StatCard from '../components/StatCard.jsx';
import AttendanceTrendChart from '../components/charts/AttendanceTrendChart.jsx';
import TopStudentsChart from '../components/charts/TopStudentsChart.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { connectSocket, disconnectSocket } from '../services/socket.js';
import { downloadBlob, getFileNameFromHeaders } from '../utils/download.js';

const DashboardPage = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState({
    summary: {
      totalStudents: 0,
      todayCount: 0,
      absentCount: 0,
      totalAttendanceRecords: 0,
      attendanceRate: 0
    },
    weeklyTrend: [],
    topStudents: []
  });
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    date: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [attendanceResponse, analyticsResponse] = await Promise.all([
          apiClient.get('/attendance', {
            params: {
              search: filters.search,
              date: filters.date
            }
          }),
          apiClient.get('/analytics/overview')
        ]);

        if (!ignore) {
          setRecords(attendanceResponse.data.records);
          setAnalytics(analyticsResponse.data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.response?.data?.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [filters.date, filters.search]);

  useEffect(() => {
    const socket = connectSocket(token);

    if (!socket) {
      return undefined;
    }

    const refreshFromSocket = async () => {
      try {
        const [attendanceResponse, analyticsResponse] = await Promise.all([
          apiClient.get('/attendance', {
            params: {
              search: filters.search,
              date: filters.date
            }
          }),
          apiClient.get('/analytics/overview')
        ]);

        setRecords(attendanceResponse.data.records);
        setAnalytics(analyticsResponse.data);
      } catch (_error) {
        // Manual refresh remains available if a socket refresh fails.
      }
    };

    socket.on('attendance:marked', refreshFromSocket);

    return () => {
      socket.off('attendance:marked', refreshFromSocket);
      disconnectSocket();
    };
  }, [filters.date, filters.search, token]);

  const exportReport = async (type) => {
    try {
      setExporting(type);
      const response = await apiClient.get(`/attendance/export/${type}`, {
        params: {
          search: filters.search,
          date: filters.date
        },
        responseType: 'blob'
      });

      downloadBlob(response.data, getFileNameFromHeaders(response.headers, `attendance.${type}`));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to export the requested report.');
    } finally {
      setExporting('');
    }
  };

  return (
    <div className="space-y-4">
      <section className="surface-panel overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Analytics</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Attendance dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Monitor attendance volume, identify top attendees, and export filtered reports without leaving the dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="soft-button rounded-2xl border border-slate-200 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
            >
              <RefreshCcw className="size-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => exportReport('csv')}
              disabled={exporting === 'csv'}
              className="soft-button rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-300"
            >
              <Download className="size-4" />
              {exporting === 'csv' ? 'Exporting CSV...' : 'Export CSV'}
            </button>
            <button
              type="button"
              onClick={() => exportReport('pdf')}
              disabled={exporting === 'pdf'}
              className="soft-button rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
            >
              <FileText className="size-4" />
              {exporting === 'pdf' ? 'Exporting PDF...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {error ? <p className="mt-5 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today present" value={analytics.summary.todayCount} hint="Students detected and marked today." accent="sky" />
        <StatCard label="Active students" value={analytics.summary.totalStudents} hint="Roster currently available for recognition." accent="emerald" />
        <StatCard label="Absent today" value={analytics.summary.absentCount} hint="Remaining active students not yet marked." accent="amber" />
        <StatCard label="Attendance rate" value={`${analytics.summary.attendanceRate}%`} hint="Today’s completion rate across active profiles." accent="violet" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <AttendanceTrendChart dataPoints={analytics.weeklyTrend} />
        <TopStudentsChart dataPoints={analytics.topStudents} />
      </section>

      <AttendanceTable
        records={records}
        search={filters.search}
        date={filters.date}
        onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
        onDateChange={(value) => setFilters((current) => ({ ...current, date: value }))}
        emptyMessage={loading ? 'Loading records...' : 'No attendance records match the current filters.'}
      />
    </div>
  );
};

export default DashboardPage;
