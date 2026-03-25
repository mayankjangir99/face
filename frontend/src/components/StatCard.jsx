const StatCard = ({ label, value, hint, accent = 'sky' }) => {
  const accents = {
    sky: 'from-sky-500/20 to-cyan-500/5 text-sky-600 dark:text-sky-300',
    emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-600 dark:text-emerald-300',
    amber: 'from-amber-500/20 to-orange-500/5 text-amber-600 dark:text-amber-300',
    violet: 'from-violet-500/20 to-fuchsia-500/5 text-violet-600 dark:text-violet-300'
  };

  return (
    <div className="surface-panel-tight overflow-hidden">
      <div className={`rounded-2xl bg-gradient-to-br ${accents[accent]} p-4`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{hint}</p>
      </div>
    </div>
  );
};

export default StatCard;
