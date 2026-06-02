import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Download, FileText, Loader2, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCourseDetailQuery } from '../../courses/hooks/useCoursesQueries';
import { learningProfileApi } from '../learningProfileApi';
import LearningLayout from '../components/LearningLayout';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { useLearningProfileQuery } from '../hooks/useLearningProfileQuery';

export default function StudentCoursePage() {
  const { id = '' } = useParams();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { data: course, isPending: loading, error } = useCourseDetailQuery(id);
  const { data: learningProfile } = useLearningProfileQuery();
  const enrollment = learningProfile?.enrollments.find((item) => item.course.id === id);
  const enrolled = Boolean(enrollment);
  const completed = (enrollment?.progress || 0) >= 100;
  const enrollMutation = useMutation({
    mutationFn: () => learningProfileApi.enroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learningProfile });
      toast.success('Course added to your learning profile');
    },
    onError: (err) => {
      toast.error(err instanceof Error && err.message.includes('Unique') ? 'You are already enrolled in this course.' : err instanceof Error ? err.message : 'Could not enroll');
    },
  });

  useEffect(() => {
    setActiveVideoIndex(0);
    setCompletedVideos([]);
  }, [course]);

  useEffect(() => {
    if (error) toast.error('Could not load this course');
  }, [error]);

  const materials = useMemo(() => course?.materials || [], [course]);
  const videos = useMemo(() => materials.flatMap((material) => (material.files || [])
    .filter((file) => file.resourceType === 'video' || file.mimeType?.startsWith('video/'))
    .map((file) => ({ ...file, materialTitle: material.title || 'Video lesson' }))), [materials]);
  const resources = useMemo(() => materials.filter((material) => material.type !== 'VIDEO').map((material) => ({
    ...material,
    files: (material.files || []).filter((file) => file.resourceType !== 'video' && !file.mimeType?.startsWith('video/')),
  })), [materials]);
  const activeVideo = videos[activeVideoIndex];
  const courseExam = course?.assignments?.find((assignment) => !assignment.isStandalone);

  function finishVideo() {
    if (!activeVideo) return;
    setCompletedVideos((items) => items.includes(activeVideo.id) ? items : [...items, activeVideo.id]);
    if (activeVideoIndex < videos.length - 1) setActiveVideoIndex((index) => index + 1);
  }
  if (loading) return <div className="grid min-h-72 place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!course) return <div className="card">Course not found.</div>;

  return (
    <LearningLayout><div className="space-y-6">
      <Link to="/student/learning" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500"><ArrowLeft size={16} /> Back to courses</Link>
      <section className="grid overflow-hidden rounded-xl bg-slate-950 text-white lg:grid-cols-[1fr_340px]">
        <div className="min-h-72 bg-black">
          {activeVideo ? <video key={activeVideo.id} className="h-full min-h-72 w-full object-contain" src={activeVideo.url} controls onEnded={finishVideo} /> : <div className="grid h-full min-h-72 place-items-center text-center text-slate-400"><PlayCircle size={54} /><p className="mt-3 text-sm">No video lessons have been uploaded yet.</p></div>}
        </div>
        <div className="p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">{course.category || 'Learning path'}</p>
          <h1 className="mt-3 text-3xl font-black">{course.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{course.description || 'Complete the lessons and pass the assessment to earn verified skills.'}</p>
          {activeVideo && <p className="mt-5 text-sm font-bold text-violet-200">Lesson {activeVideoIndex + 1} of {videos.length}: {activeVideo.materialTitle}</p>}
          {!enrolled && <button onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending} className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-60">{enrollMutation.isPending ? 'Enrolling...' : 'Enroll in course'}</button>}
          {completed ? <p className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-black text-emerald-300"><CheckCircle2 size={17} /> Course completed</p> : enrolled && <p className="mt-6 flex items-center gap-2 text-sm font-black text-emerald-300"><CheckCircle2 size={17} /> Enrolled in this course</p>}
          {courseExam ? <Link to={`/student/assignments/${courseExam.id}`} className="mt-3 block rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-black">Take course exam</Link> : <p className="mt-3 text-center text-xs font-bold text-slate-400">The instructor has not added a course exam yet.</p>}
        </div>
      </section>
      <section className="card">
        <h2 className="flex items-center gap-2 text-xl font-black"><BookOpen size={20} /> Video lessons</h2>
        <p className="mt-1 text-sm text-neutral-500">Finish a lesson to continue automatically to the next step.</p>
        <div className="mt-4 space-y-2">
          {videos.length === 0 && <p className="text-sm text-neutral-500">No video lessons uploaded yet.</p>}
          {videos.map((video, index) => <button key={video.id} onClick={() => setActiveVideoIndex(index)} className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${index === activeVideoIndex ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' : 'border-neutral-200 dark:border-neutral-700'}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${completedVideos.includes(video.id) ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>{completedVideos.includes(video.id) ? <CheckCircle2 size={16} /> : index + 1}</span><span><b className="block text-sm">{video.materialTitle}</b><span className="text-xs text-neutral-500">{video.originalName || `Video lesson ${index + 1}`}</span></span></button>)}
        </div>
      </section>
      <section className="card">
        <h2 className="flex items-center gap-2 text-xl font-black"><FileText size={20} /> Study materials</h2>
        <p className="mt-1 text-sm text-neutral-500">Download the resources shared by your instructor. Video lessons stay available in the player above.</p>
        <div className="mt-4 space-y-3">
          {resources.length === 0 && <p className="text-sm text-neutral-500">No additional study materials uploaded yet.</p>}
          {resources.map((material) => <article key={material.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <div><h3 className="font-black">{material.title}</h3><p className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-500">{material.type}</p>{material.description && <p className="mt-2 text-sm text-neutral-500">{material.description}</p>}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {material.files?.map((file) => <a key={file.id} href={file.url} download={file.originalName} target="_blank" rel="noreferrer" className="btn-white rounded-lg text-xs"><Download size={14} /> {file.originalName || 'Download resource'}</a>)}
              {!material.files?.length && <span className="text-xs text-neutral-400">No file attached.</span>}
            </div>
          </article>)}
        </div>
      </section>
      <p className="flex items-center gap-2 text-xs font-bold text-emerald-600"><CheckCircle2 size={14} /> {completed ? 'You completed this course. Its verified skills are now on your profile.' : 'Finish the assessment to add the course skills to your profile.'}</p>
    </div></LearningLayout>
  );
}
