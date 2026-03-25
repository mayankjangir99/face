import { useEffect, useState } from 'react';
import { Plus, Search, Shield, UsersRound } from 'lucide-react';
import { apiClient } from '../api/client.js';
import StudentCard from '../components/StudentCard.jsx';
import StudentFormModal from '../components/StudentFormModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const StudentsPage = () => {
  const { registerUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [savingStudent, setSavingStudent] = useState(false);
  const [pageMessage, setPageMessage] = useState('');
  const [pageError, setPageError] = useState('');
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher'
  });
  const [creatingStaff, setCreatingStaff] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setPageError('');
      const { data } = await apiClient.get('/students');
      setStudents(data.students);
    } catch (requestError) {
      setPageError(requestError.response?.data?.message || 'Unable to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleStudentSave = async (formData) => {
    try {
      setSavingStudent(true);
      setPageError('');
      setPageMessage('');

      if (selectedStudent) {
        await apiClient.put(`/students/${selectedStudent._id}`, formData);
      } else {
        await apiClient.post('/add-student', formData);
      }

      await loadStudents();
      setModalOpen(false);
      setSelectedStudent(null);
      setPageMessage(selectedStudent ? 'Student updated successfully.' : 'Student added successfully.');
    } catch (requestError) {
      setPageError(requestError.response?.data?.message || 'Unable to save student.');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    const shouldDelete = window.confirm(`Delete ${student.name}? This removes the profile images used for recognition.`);

    if (!shouldDelete) {
      return;
    }

    try {
      setPageError('');
      await apiClient.delete(`/delete-student/${student._id}`);
      await loadStudents();
      setPageMessage('Student deleted successfully.');
    } catch (requestError) {
      setPageError(requestError.response?.data?.message || 'Unable to delete student.');
    }
  };

  const handleCreateStaff = async (event) => {
    event.preventDefault();

    try {
      setCreatingStaff(true);
      setPageError('');
      await registerUser(staffForm);
      setStaffForm({
        name: '',
        email: '',
        password: '',
        role: 'teacher'
      });
      setPageMessage('Staff account created successfully.');
    } catch (requestError) {
      setPageError(requestError.response?.data?.message || 'Unable to create staff account.');
    } finally {
      setCreatingStaff(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [student.name, student.studentCode, student.department, student.className]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  return (
    <div className="space-y-4">
      <section className="surface-panel">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Admin</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Student and staff management</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Maintain the recognition roster, refresh training images, and issue teacher/admin access without leaving the dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedStudent(null);
              setModalOpen(true);
            }}
            className="soft-button rounded-2xl bg-slate-950 text-white dark:bg-sky-500 dark:text-slate-950"
          >
            <Plus className="size-4" />
            Add student
          </button>
        </div>

        {pageMessage ? (
          <p className="mt-5 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
            {pageMessage}
          </p>
        ) : null}

        {pageError ? (
          <p className="mt-5 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{pageError}</p>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-title">Recognition roster</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Upload and maintain the labeled images that face-api.js uses for matching.
              </p>
            </div>

            <label className="relative max-w-sm flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="soft-input pl-11"
                placeholder="Search students"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard
                  key={student._id}
                  student={student}
                  onEdit={(entry) => {
                    setSelectedStudent(entry);
                    setModalOpen(true);
                  }}
                  onDelete={handleDeleteStudent}
                />
              ))
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {loading ? 'Loading students...' : 'No students match the current search.'}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600 dark:text-sky-300">
                <UsersRound className="size-5" />
              </div>
              <div>
                <h2 className="section-title">Roster guidance</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Improving recognition quality starts with the training set.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>Use evenly lit frontal portraits and avoid group photos or heavily compressed screenshots.</p>
              <p>Keep at least two images per student so the matcher can tolerate small pose changes.</p>
              <p>After editing student photos, revisit the recognition page so descriptors are rebuilt from the updated images.</p>
            </div>
          </div>

          <div className="surface-panel">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300">
                <Shield className="size-5" />
              </div>
              <div>
                <h2 className="section-title">Staff access</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create teacher or additional admin accounts.</p>
              </div>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleCreateStaff}>
              <input
                className="soft-input"
                placeholder="Staff name"
                value={staffForm.name}
                onChange={(event) => setStaffForm((current) => ({ ...current, name: event.target.value }))}
              />
              <input
                className="soft-input"
                type="email"
                placeholder="Staff email"
                value={staffForm.email}
                onChange={(event) => setStaffForm((current) => ({ ...current, email: event.target.value }))}
              />
              <input
                className="soft-input"
                type="password"
                placeholder="Temporary password"
                value={staffForm.password}
                onChange={(event) => setStaffForm((current) => ({ ...current, password: event.target.value }))}
              />
              <select
                className="soft-input"
                value={staffForm.role}
                onChange={(event) => setStaffForm((current) => ({ ...current, role: event.target.value }))}
              >
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>

              <button type="submit" disabled={creatingStaff} className="soft-button w-full rounded-2xl bg-slate-950 text-white dark:bg-sky-500 dark:text-slate-950">
                {creatingStaff ? 'Creating account...' : 'Create staff account'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <StudentFormModal
        open={modalOpen}
        student={selectedStudent}
        saving={savingStudent}
        onClose={() => {
          setModalOpen(false);
          setSelectedStudent(null);
        }}
        onSave={handleStudentSave}
      />
    </div>
  );
};

export default StudentsPage;
