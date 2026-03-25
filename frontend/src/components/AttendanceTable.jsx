import { Search, CalendarDays, Camera } from 'lucide-react';
import { formatConfidence, formatShortDate, formatTime } from '../utils/formatters.js';

const AttendanceTable = ({ records, search, date, onSearchChange, onDateChange, emptyMessage = 'No records found.' }) => {
  return (
    <div className="surface-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="section-title">Attendance Log</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search by student name or code and narrow results by date.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="soft-input pl-11"
              placeholder="Search student"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>

          <label className="relative">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="soft-input pl-11"
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
            <thead className="bg-slate-100/80 text-xs uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Time</th>
                <th className="px-5 py-4">Confidence</th>
                <th className="px-5 py-4">Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 bg-white/60 dark:divide-slate-800 dark:bg-slate-950/50">
              {records.length > 0 ? (
                records.map((record) => (
                  <tr key={record._id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/60">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{record.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{record.studentCode}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatShortDate(record.dateKey)}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatTime(record.attendedAt)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                        {formatConfidence(record.confidence)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {record.snapshotUrl ? (
                        <a
                          href={record.snapshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-500 dark:text-sky-300"
                        >
                          <Camera className="size-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">Not stored</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500 dark:text-slate-400" colSpan="5">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
