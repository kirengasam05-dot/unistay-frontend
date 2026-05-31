import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { skillsApi } from '../../skills/skillsApi';
import type { Skill, CreateSkillPayload, SkillLevel } from '../../skills/skillsApi';
import { useConfirm } from '../../../components/ui/ConfirmDialog';

const LEVELS: SkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const levelColor: Record<SkillLevel, string> = {
  BEGINNER:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  INTERMEDIATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ADVANCED:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const BLANK: CreateSkillPayload = { name: '', category: '', level: 'BEGINNER' };

export default function AdminSkillsPage() {
  const confirm = useConfirm();
  const [skills, setSkills]     = useState<Skill[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState<CreateSkillPayload>(BLANK);
  const [errors, setErrors]     = useState<Partial<CreateSkillPayload>>({});
  const [search, setSearch]     = useState('');

  useEffect(() => {
    skillsApi.getAll()
      .then(setSkills)
      .catch(() => toast.error('Failed to load skills'))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditId(null);
    setForm(BLANK);
    setErrors({});
    setShowForm(true);
  }

  function openEdit(skill: Skill) {
    setEditId(skill.id);
    setForm({ name: skill.name, category: skill.category, level: skill.level });
    setErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(BLANK);
    setErrors({});
  }

  function validate(): boolean {
    const e: Partial<CreateSkillPayload> = {};
    if (!form.name.trim())     e.name = 'Name is required (min 2 chars)';
    if (!form.category.trim()) e.category = 'Category is required (min 2 chars)';
    if (Object.keys(e).length) { setErrors(e); return false; }
    return true;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editId) {
        const updated = await skillsApi.update(editId, form);
        setSkills(prev => prev.map(s => s.id === editId ? updated : s));
        toast.success('Skill updated');
      } else {
        const created = await skillsApi.create(form);
        setSkills(prev => [created, ...prev]);
        toast.success('Skill created');
      }
      closeForm();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save skill');
    } finally {
      setSaving(false);
    }
  }

  async function remove(skill: Skill) {
    const ok = await confirm({
      title: `Delete "${skill.name}"?`,
      description: 'This skill will be permanently removed.',
      confirmText: 'Delete skill',
      variant: 'destructive',
    });
    if (!ok) return;
    setDeletingId(skill.id);
    try {
      await skillsApi.remove(skill.id);
      setSkills(prev => prev.filter(s => s.id !== skill.id));
      toast.success('Skill deleted');
    } catch {
      toast.error('Failed to delete skill');
    } finally {
      setDeletingId(null);
    }
  }

  const visible = skills.filter(s =>
    (s.name + s.category + s.level).toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = 'input w-full';
  const labelClass = 'block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5';

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">Skills</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Manage the skill library. Skills are linked to jobs and student profiles.
            </p>
          </div>
          <button onClick={showForm ? closeForm : openCreate}
            className="btn-black shrink-0 rounded-xl flex items-center gap-2">
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Cancel' : 'New skill'}
          </button>
        </div>

        {/* form */}
        {showForm && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-800/50">
            <h2 className="mb-4 font-black text-neutral-900 dark:text-white">
              {editId ? 'Edit skill' : 'New skill'}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Skill name *</label>
                <input
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(v => ({ ...v, name: undefined })); }}
                  placeholder="e.g. React, Communication"
                  className={inputClass}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <input
                  value={form.category}
                  onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setErrors(v => ({ ...v, category: undefined })); }}
                  placeholder="e.g. Digital Skills, Communication"
                  className={inputClass}
                />
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
              </div>
              <div>
                <label className={labelClass}>Level</label>
                <select
                  value={form.level}
                  onChange={e => setForm(f => ({ ...f, level: e.target.value as SkillLevel }))}
                  className={inputClass}
                >
                  {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={save} disabled={saving}
                className="btn-black rounded-xl flex items-center gap-2 disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Saving…' : editId ? 'Update skill' : 'Create skill'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {LEVELS.map(level => (
          <div key={level} className="card">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {level.charAt(0) + level.slice(1).toLowerCase()}
            </p>
            <p className="mt-1 text-3xl font-black text-neutral-900 dark:text-white">
              {skills.filter(s => s.level === level).length}
            </p>
          </div>
        ))}
      </div>

      {/* search + list */}
      <div className="card">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, category or level…"
          className="input mb-5"
        />

        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-neutral-400" size={32} /></div>
        ) : visible.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-black text-neutral-900 dark:text-white">No skills found</p>
            <p className="mt-1 text-sm text-neutral-500">
              {search ? 'Try a different search.' : 'Create your first skill above.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(skill => (
              <div key={skill.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/50">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <p className="font-black text-neutral-900 dark:text-white">{skill.name}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{skill.category}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${levelColor[skill.level]}`}>
                    {skill.level.charAt(0) + skill.level.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(skill)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(skill)} disabled={deletingId === skill.id}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors">
                    {deletingId === skill.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            ))}
            <p className="pt-2 text-center text-xs text-neutral-400 dark:text-neutral-600">
              {visible.length} of {skills.length} skills
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
