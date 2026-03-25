import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, Sparkles, Waves } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, bootstrapAdmin, isAuthenticated, requiresBootstrap } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (requiresBootstrap) {
        await bootstrapAdmin(form);
      } else {
        await login({
          email: form.email,
          password: form.password
        });
      }

      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to complete the request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/70 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden bg-hero-grid px-6 py-10 sm:px-10 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-600 dark:text-sky-300">VisionID Suite</p>
            <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Face recognition attendance built for real classrooms, labs, and front desks.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 dark:text-slate-300">
              Run multi-face detection in the browser, prevent duplicate attendance for the day, capture evidence
              snapshots, and track live metrics from one dashboard.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Camera,
                title: 'Live recognition',
                text: 'Browser-based face matching with local model files and uploaded student training images.'
              },
              {
                icon: Waves,
                title: 'Instant updates',
                text: 'Socket-driven dashboard refresh, alerts for unknown faces, and voice feedback on attendance.'
              },
              {
                icon: ShieldCheck,
                title: 'Admin controls',
                text: 'JWT authentication, role-based access, student management, exports, and analytics.'
              }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="surface-panel-tight">
                  <div className="rounded-2xl bg-slate-950/90 p-3 text-white dark:bg-white/10 dark:text-sky-200">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="surface-panel">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-3 text-white shadow-lg">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h2 className="section-title">{requiresBootstrap ? 'Create the first admin' : 'Secure sign-in'}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {requiresBootstrap
                      ? 'No accounts exist yet. Bootstrap the first administrator to activate the system.'
                      : 'Enter your staff credentials to access the attendance workspace.'}
                  </p>
                </div>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                {requiresBootstrap ? (
                  <input
                    className="soft-input"
                    placeholder="Administrator name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  />
                ) : null}

                <input
                  className="soft-input"
                  placeholder="Email address"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />

                <input
                  className="soft-input"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />

                {error ? (
                  <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="soft-button w-full rounded-2xl bg-slate-950 py-3.5 text-white hover:scale-[1.01] dark:bg-sky-500 dark:text-slate-950"
                >
                  {submitting ? 'Please wait...' : requiresBootstrap ? 'Create admin account' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
