import { useEffect, useMemo, useState } from 'react';
import { BookOpen, FileQuestion, FileText, Loader2, Pencil, Plus, Trash2, Upload, Users, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '../../courses/coursesApi';
import type { Course } from '../../courses/coursesApi';
import { learningAuthorApi } from '../learningAuthorApi';
import type { Exam, Material } from '../learningAuthorApi';
import { learningProfileApi } from '../../student/learningProfileApi';
import type { InstructorEnrollment } from '../../student/learningProfileApi';

export default function InstructorContentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<Material['type']>('VIDEO');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialDuration, setMaterialDuration] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialModal, setMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [examStandalone, setExamStandalone] = useState(false);
  const [examPassingScore, setExamPassingScore] = useState(70);
  const [examTimeLimit, setExamTimeLimit] = useState(45);
  const [examModal, setExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [question, setQuestion] = useState<Record<string, string>>({});
  const [option, setOption] = useState<Record<string, string>>({});
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] = useState('');
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [optionDraft, setOptionDraft] = useState('');
  const [enrollments, setEnrollments] = useState<InstructorEnrollment[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [courseList, materialList, examList] = await Promise.all([
        coursesApi.getAll(), learningAuthorApi.getMaterials(), learningAuthorApi.getExams(),
      ]);
      setCourses(courseList);
      setCourseId((value) => value || courseList[0]?.id || '');
      setMaterials(materialList);
      setExams(examList);
      setEnrollments(await learningProfileApi.getInstructorEnrollments());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load learning studio');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  const visibleMaterials = useMemo(() => materials.filter((item) => item.courseId === courseId || item.course?.id === courseId), [materials, courseId]);
  const visibleExams = useMemo(() => exams.filter((item) => item.courseId === courseId), [exams, courseId]);

  function openMaterialForm(item?: Material) {
    setEditingMaterial(item || null);
    setMaterialTitle(item?.title || '');
    setMaterialType(item?.type || 'VIDEO');
    setMaterialDescription(item?.description || '');
    setMaterialDuration(item?.duration ? String(item.duration) : '');
    setMaterialFile(null);
    setMaterialModal(true);
  }

  function closeMaterialForm() {
    setMaterialModal(false);
    setEditingMaterial(null);
    setMaterialTitle('');
    setMaterialDescription('');
    setMaterialDuration('');
    setMaterialFile(null);
  }

  async function saveMaterial() {
    if (!courseId || materialTitle.trim().length < 3) return toast.error('Enter a material title.');
    const hasUploadedVideo = editingMaterial?.files?.some((file) => file.resourceType === 'video' || file.mimeType?.startsWith('video/'));
    if (materialType === 'VIDEO' && !materialFile && !hasUploadedVideo) return toast.error('Upload a video file for this lesson.');
    if (materialType === 'VIDEO' && materialFile && !materialFile.type.startsWith('video/')) return toast.error('Video lessons require a video file.');
    const data = { title: materialTitle.trim(), type: materialType, description: materialDescription.trim() || undefined, duration: materialDuration ? Number(materialDuration) : undefined };
    if (editingMaterial) {
      const updated = await learningAuthorApi.updateMaterial(editingMaterial.id, data);
      const uploaded = materialFile ? await learningAuthorApi.uploadMaterialFile(updated.id, materialFile) : null;
      setMaterials((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated, files: uploaded ? [...(item.files || []), uploaded] : item.files } : item));
      toast.success('Material updated');
    } else {
      const created = await learningAuthorApi.createMaterial(courseId, data);
      const uploaded = materialFile ? await learningAuthorApi.uploadMaterialFile(created.id, materialFile) : null;
      setMaterials((items) => [{ ...created, files: uploaded ? [uploaded] : [] }, ...items]);
      toast.success('Material added');
    }
    closeMaterialForm();
  }

  function openExamForm(exam?: Exam) {
    setEditingExam(exam || null);
    setExamTitle(exam?.title || '');
    setExamStandalone(exam?.isStandalone ?? false);
    setExamPassingScore(exam?.passingScore ?? 70);
    setExamTimeLimit(exam?.timeLimit ?? 45);
    setExamModal(true);
  }

  function closeExamForm() {
    setExamModal(false);
    setEditingExam(null);
    setExamTitle('');
    setExamStandalone(false);
    setExamPassingScore(70);
    setExamTimeLimit(45);
  }

  async function saveExam() {
    if (!courseId || examTitle.trim().length < 3) return toast.error('Enter an exam title.');
    if (examPassingScore < 0 || examPassingScore > 100) return toast.error('Passing mark must be between 0 and 100.');
    if (examTimeLimit < 1) return toast.error('Time limit must be at least one minute.');
    const data = { title: examTitle.trim(), isStandalone: examStandalone, passingScore: examPassingScore, timeLimit: examTimeLimit };
    if (editingExam) {
      const updated = await learningAuthorApi.updateExam(editingExam.id, data);
      setExams((items) => items.map((item) => item.id === updated.id ? updated : item));
      toast.success('Exam settings updated');
    } else {
      const created = await learningAuthorApi.createExam({ courseId, ...data });
      setExams((items) => [created, ...items]);
      toast.success('Exam added');
    }
    closeExamForm();
  }

  async function uploadFile(materialId: string, file?: File) {
    if (!file) return;
    const material = materials.find((item) => item.id === materialId);
    if (material?.type === 'VIDEO' && !file.type.startsWith('video/')) return toast.error('Video lessons require a video file.');
    try {
      const uploaded = await learningAuthorApi.uploadMaterialFile(materialId, file);
      setMaterials((items) => items.map((item) => item.id === materialId ? { ...item, files: [...(item.files || []), uploaded] } : item));
      toast.success('Material file uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload file');
    }
  }

  async function removeFile(materialId: string, fileId: string) {
    await learningAuthorApi.removeMaterialFile(fileId);
    setMaterials((items) => items.map((item) => item.id === materialId ? { ...item, files: item.files?.filter((file) => file.id !== fileId) } : item));
  }

  async function saveQuestion(questionId: string) {
    const text = questionDraft.trim();
    if (!text) return;
    const updated = await learningAuthorApi.updateQuestion(questionId, text);
    setExams((items) => items.map((exam) => ({ ...exam, questions: exam.questions?.map((item) => item.id === questionId ? { ...item, ...updated } : item) })));
    setEditingQuestion(null);
    setQuestionDraft('');
  }

  async function removeQuestion(questionId: string) {
    await learningAuthorApi.removeQuestion(questionId);
    setExams((items) => items.map((exam) => ({ ...exam, questions: exam.questions?.filter((item) => item.id !== questionId) })));
  }

  async function saveOption(questionId: string, answer: { id: string; text: string; isCorrect?: boolean }) {
    const text = optionDraft.trim();
    if (!text) return;
    const updated = await learningAuthorApi.updateOption(answer.id, { text, isCorrect: Boolean(answer.isCorrect) });
    setExams((items) => items.map((exam) => ({ ...exam, questions: exam.questions?.map((item) => item.id === questionId ? { ...item, options: item.options?.map((value) => value.id === answer.id ? updated : value) } : item) })));
    setEditingOption(null);
    setOptionDraft('');
  }

  async function removeOption(questionId: string, optionId: string) {
    await learningAuthorApi.removeOption(optionId);
    setExams((items) => items.map((exam) => ({ ...exam, questions: exam.questions?.map((item) => item.id === questionId ? { ...item, options: item.options?.filter((value) => value.id !== optionId) } : item) })));
  }

  async function addQuestion(examId: string) {
    const text = question[examId]?.trim();
    if (!text) return;
    const created = await learningAuthorApi.createQuestion(examId, text);
    setExams((items) => items.map((exam) => exam.id === examId ? { ...exam, questions: [...(exam.questions || []), { ...created, options: [] }] } : exam));
    setQuestion((values) => ({ ...values, [examId]: '' }));
  }

  async function addOption(questionId: string, isCorrect = false) {
    const text = option[questionId]?.trim();
    if (!text) return;
    const created = await learningAuthorApi.createOption(questionId, text, isCorrect);
    setExams((items) => items.map((exam) => ({ ...exam, questions: exam.questions?.map((q) => q.id === questionId ? { ...q, options: [...(q.options || []), created] } : q) })));
    setOption((values) => ({ ...values, [questionId]: '' }));
  }

  if (loading) return <div className="card grid min-h-72 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-950 p-7 text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Learning studio</p>
        <h1 className="mt-2 text-3xl font-black">Materials, exams, questions, and answers</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">Choose a course, then upload lessons and build its assessment from this page.</p>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-5 w-full max-w-xl rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900">
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
      </section>

      {materialModal && <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Course content</p><h2 className="mt-1 text-2xl font-black">{editingMaterial ? 'Update material' : 'Add material'}</h2></div><button onClick={closeMaterialForm} className="btn-white rounded-lg">Cancel</button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">Title<input className="input mt-2" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} placeholder="Lesson title" /></label><label className="text-sm font-bold">Type<select className="input mt-2" value={materialType} onChange={(e) => setMaterialType(e.target.value as Material['type'])}>{['VIDEO', 'PDF', 'ARTICLE', 'QUIZ'].map((type) => <option key={type}>{type}</option>)}</select></label><label className="text-sm font-bold">Duration<input className="input mt-2" type="number" min="1" value={materialDuration} onChange={(e) => setMaterialDuration(e.target.value)} placeholder="Minutes" /></label><label className="text-sm font-bold sm:col-span-2">Description<textarea className="input mt-2 resize-none" rows={3} value={materialDescription} onChange={(e) => setMaterialDescription(e.target.value)} placeholder="Optional description" /></label><label className="text-sm font-bold sm:col-span-2">Upload file {materialType === 'VIDEO' ? <span className="text-red-500">required</span> : <span className="font-normal text-neutral-500">optional</span>}<input className="input mt-2" type="file" accept={materialType === 'VIDEO' ? 'video/*' : undefined} onChange={(e) => setMaterialFile(e.target.files?.[0] || null)} /></label></div>
        <button onClick={saveMaterial} className="btn-black mt-5 rounded-lg">{editingMaterial ? 'Save material changes' : 'Upload material'}</button>
      </section>}

      {examModal && <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Assessment setup</p><h2 className="mt-1 text-2xl font-black">{editingExam ? 'Update exam' : 'Add exam'}</h2></div><button onClick={closeExamForm} className="btn-white rounded-lg">Cancel</button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">Exam title<input className="input mt-2" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} /></label><label className="text-sm font-bold sm:col-span-2">Exam type<select className="input mt-2" value={examStandalone ? 'standalone' : 'course'} onChange={(e) => setExamStandalone(e.target.value === 'standalone')}><option value="course">Course exam</option><option value="standalone">Standalone exam</option></select><span className="mt-1 block text-xs font-normal text-neutral-500">Course exams open from the course page. Standalone exams appear in the assignments catalog.</span></label><label className="text-sm font-bold">Passing mark<input className="input mt-2" type="number" min="0" max="100" value={examPassingScore} onChange={(e) => setExamPassingScore(Number(e.target.value))} /></label><label className="text-sm font-bold">Time limit<input className="input mt-2" type="number" min="1" value={examTimeLimit} onChange={(e) => setExamTimeLimit(Number(e.target.value))} /></label></div>
        <button onClick={saveExam} className="btn-black mt-5 rounded-lg">{editingExam ? 'Save exam changes' : 'Create exam'}</button>
      </section>}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card">
          <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-black"><BookOpen size={20} /> Lessons and materials</h2><button onClick={() => openMaterialForm()} className="btn-black rounded-lg"><Plus size={16} /> Add material</button></div>
          {(['VIDEO', 'RESOURCE'] as const).map((section) => {
            const sectionItems = visibleMaterials.filter((item) => section === 'VIDEO' ? item.type === 'VIDEO' : item.type !== 'VIDEO');
            return <div className="mt-5" key={section}><h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-neutral-500">{section === 'VIDEO' ? <Video size={15} /> : <FileText size={15} />}{section === 'VIDEO' ? 'Video lessons' : 'Downloadable materials'}</h3><div className="mt-2 space-y-2">{sectionItems.map((item) => <div key={item.id} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800"><div className="flex items-center justify-between gap-3"><div><b>{item.title}</b><p className="text-xs text-neutral-500">{item.type}{item.duration ? ` - ${item.duration} min` : ''}</p></div><div className="flex items-center gap-3"><button onClick={() => openMaterialForm(item)} className="text-neutral-500" title="Edit material"><Pencil size={15} /></button><label className="cursor-pointer text-neutral-500 hover:text-neutral-900 dark:hover:text-white" title="Upload file"><Upload size={16} /><input type="file" className="hidden" accept={item.type === 'VIDEO' ? 'video/*' : undefined} onChange={(e) => uploadFile(item.id, e.target.files?.[0])} /></label><button onClick={() => learningAuthorApi.removeMaterial(item.id).then(() => setMaterials((all) => all.filter((x) => x.id !== item.id)))} className="text-red-500"><Trash2 size={16} /></button></div></div>{item.files?.map((file) => <div key={file.id} className="mt-2 flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-xs dark:bg-neutral-900"><span className="truncate font-semibold">{file.originalName || file.url.split('/').pop()}</span><button onClick={() => removeFile(item.id, file.id)} className="text-red-500" title="Remove uploaded file"><Trash2 size={14} /></button></div>)}</div>)}</div></div>;
          })}
        </section>

        <section className="card">
          <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-black"><FileQuestion size={20} /> Course exams</h2><button onClick={() => openExamForm()} className="btn-black rounded-lg"><Plus size={16} /> Add exam</button></div>
          <div className="mt-4 space-y-4">
            {visibleExams.map((exam) => <div key={exam.id} className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
              <div className="flex justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><b>{exam.title}</b><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${exam.isStandalone ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>{exam.isStandalone ? 'Standalone' : 'Course exam'}</span></div><p className="mt-1 text-xs text-neutral-500">Pass mark {exam.passingScore ?? 70}% - {exam.timeLimit ?? 45} minutes</p></div><div className="flex gap-2"><button onClick={() => openExamForm(exam)} className="text-neutral-500" title="Edit exam settings"><Pencil size={15} /></button><button onClick={() => learningAuthorApi.removeExam(exam.id).then(() => setExams((all) => all.filter((x) => x.id !== exam.id)))} className="text-red-500"><Trash2 size={16} /></button></div></div>
              <div className="mt-3 flex gap-2"><input className="input" value={question[exam.id] || ''} onChange={(e) => setQuestion((v) => ({ ...v, [exam.id]: e.target.value }))} placeholder="Add a question" /><button onClick={() => addQuestion(exam.id)} className="btn-white rounded-xl"><Plus size={15} /></button></div>
              {exam.questions?.map((q) => <div key={q.id} className="mt-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800">
                <div className="flex items-start justify-between gap-3">{editingQuestion === q.id ? <div className="flex flex-1 gap-2"><input className="input py-2" value={questionDraft} onChange={(e) => setQuestionDraft(e.target.value)} /><button onClick={() => saveQuestion(q.id)} className="btn-black rounded-lg text-xs">Save</button></div> : <p className="text-sm font-bold">{q.text}</p>}<div className="flex gap-2"><button onClick={() => { setEditingQuestion(q.id); setQuestionDraft(q.text); }} className="text-black"><Pencil size={14} /></button><button onClick={() => removeQuestion(q.id)} className="text-black"><Trash2 size={14} /></button></div></div>
                <div className="mt-2 flex gap-2"><input className="input py-2" value={option[q.id] || ''} onChange={(e) => setOption((v) => ({ ...v, [q.id]: e.target.value }))} placeholder="Answer option" /><button onClick={() => addOption(q.id)} className="btn-white rounded-lg text-xs">Add</button><button onClick={() => addOption(q.id, true)} className="btn-black rounded-lg text-xs">Correct</button></div>
                <div className="mt-2 space-y-2">{q.options?.map((a) => <div key={a.id} className="flex items-center justify-between gap-2 bg-white px-3 py-2 text-xs font-bold">{editingOption === a.id ? <input className="input py-2" value={optionDraft} onChange={(e) => setOptionDraft(e.target.value)} /> : <span>{a.text}{a.isCorrect ? ' - Correct answer' : ''}</span>}<span className="flex gap-2"><button onClick={() => editingOption === a.id ? saveOption(q.id, a) : (setEditingOption(a.id), setOptionDraft(a.text))}><Pencil size={11} /></button><button onClick={() => removeOption(q.id, a.id)}><Trash2 size={11} /></button></span></div>)}</div>
              </div>)}
            </div>)}
          </div>
        </section>
      </div>
      <section className="card">
        <h2 className="flex items-center gap-2 text-xl font-black"><Users size={20} /> Enrolled students</h2>
        <p className="mt-1 text-sm text-neutral-500">Students enrolled in the selected course.</p>
        <div className="mt-4 space-y-2">
          {enrollments.filter((item) => item.course.id === courseId).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800"><div><p className="font-black">{item.user.fullName}</p><p className="text-xs text-neutral-500">{item.user.email}</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{Math.round(item.progress)}% complete</span></div>)}
          {enrollments.filter((item) => item.course.id === courseId).length === 0 && <p className="text-sm text-neutral-500">No students enrolled in this course yet.</p>}
        </div>
      </section>
    </div>
  );
}
