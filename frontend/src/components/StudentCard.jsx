import { Pencil, Trash2, UserSquare2 } from 'lucide-react';

const StudentCard = ({ student, onEdit, onDelete }) => {
  const preview = student.imageUrls?.[0];

  return (
    <div className="surface-panel-tight flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {preview ? (
            <img
              src={preview}
              alt={student.name}
              className="size-16 rounded-2xl object-cover ring-2 ring-white/60 dark:ring-slate-800"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <UserSquare2 className="size-7" />
            </div>
          )}

          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{student.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{student.studentCode}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {student.department || 'No department'} {student.className ? `• ${student.className}` : ''}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            student.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
              : 'bg-slate-500/10 text-slate-500 dark:text-slate-300'
          }`}
        >
          {student.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400">
        <div>
          <p className="text-xs uppercase tracking-[0.2em]">Email</p>
          <p className="mt-1 truncate">{student.email || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em]">Phone</p>
          <p className="mt-1">{student.phone || 'Not provided'}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(student)}
          className="soft-button flex-1 rounded-2xl bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 dark:text-sky-300"
        >
          <Pencil className="size-4" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(student)}
          className="soft-button flex-1 rounded-2xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-300"
        >
          <Trash2 className="size-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
