import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

const emptyForm = {
  name: '',
  studentCode: '',
  department: '',
  className: '',
  email: '',
  phone: '',
  notes: '',
  status: 'active'
};

const StudentFormModal = ({ open, student, saving, onClose, onSave }) => {
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [replaceImages, setReplaceImages] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      student
        ? {
            name: student.name || '',
            studentCode: student.studentCode || '',
            department: student.department || '',
            className: student.className || '',
            email: student.email || '',
            phone: student.phone || '',
            notes: student.notes || '',
            status: student.status || 'active'
          }
        : emptyForm
    );
    setExistingImages(student ? student.imagePaths.map((path, index) => ({ path, url: student.imageUrls[index] })) : []);
    setNewFiles([]);
    setReplaceImages(false);
    setError('');
  }, [open, student]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.studentCode.trim()) {
      setError('Student name and student code are required.');
      return;
    }

    if (!student && newFiles.length === 0) {
      setError('Add at least one student image so face recognition has a training sample.');
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    formData.append('replaceImages', replaceImages ? 'true' : 'false');
    formData.append(
      'keepImages',
      JSON.stringify(replaceImages ? [] : existingImages.map((image) => image.path))
    );

    newFiles.forEach((file) => {
      formData.append('images', file);
    });

    setError('');
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="section-title">{student ? 'Update student' : 'Add student'}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Upload multiple clear photos for better descriptor generation and recognition accuracy.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 dark:border-slate-700"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="soft-input"
              placeholder="Student name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              className="soft-input"
              placeholder="Student code"
              value={form.studentCode}
              onChange={(event) => setForm((current) => ({ ...current, studentCode: event.target.value }))}
            />
            <input
              className="soft-input"
              placeholder="Department"
              value={form.department}
              onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
            />
            <input
              className="soft-input"
              placeholder="Class / Section"
              value={form.className}
              onChange={(event) => setForm((current) => ({ ...current, className: event.target.value }))}
            />
            <input
              className="soft-input"
              placeholder="Email address"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <input
              className="soft-input"
              placeholder="Phone number"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <select
              className="soft-input"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <textarea
            className="soft-input min-h-28"
            placeholder="Notes"
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          />

          <div className="surface-panel-tight">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold">Training images</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Use sharp, front-facing photos with good lighting. Two to five images per student is ideal.
                </p>
              </div>

              {student ? (
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={replaceImages}
                    onChange={(event) => setReplaceImages(event.target.checked)}
                  />
                  Replace existing images
                </label>
              ) : null}
            </div>

            {!replaceImages && existingImages.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {existingImages.map((image) => (
                  <div key={image.path} className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <img src={image.url} alt="Student" className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setExistingImages((current) => current.filter((entry) => entry.path !== image.path))}
                      className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-2 text-white"
                      aria-label="Remove existing image"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500 transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-sky-500">
              <ImagePlus className="size-5" />
              <span>{newFiles.length ? `${newFiles.length} image(s) selected` : 'Upload JPG, PNG, or WEBP images'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => setNewFiles(Array.from(event.target.files || []))}
              />
            </label>
          </div>

          {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="soft-button rounded-2xl border border-slate-200 bg-white/80 text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="soft-button rounded-2xl bg-slate-950 text-white dark:bg-sky-500 dark:text-slate-950">
              {saving ? 'Saving...' : student ? 'Save changes' : 'Add student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
