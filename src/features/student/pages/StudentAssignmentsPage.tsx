import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, FileQuestion, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { skillsApi } from '../../skills/skillsApi';
import type { Assignment, ExamAttempt, ExamQuestion, ExamResult } from '../../skills/skillsApi';
import LearningLayout from '../components/LearningLayout';

const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function StudentAssignmentsPage() {
  const { assignmentId } = useParams();
  const queryClient = useQueryClient();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submitRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    setLoading(true);
    if (assignmentId) {
      skillsApi.getAssignment(assignmentId).then((assignment) => {
        setAssignments([assignment]);
        void start(assignment);
      }).catch(() => toast.error('Could not load this exam')).finally(() => setLoading(false));
      return;
    }
    skillsApi.getAssignments().then(setAssignments).catch(() => toast.error('Could not load exams')).finally(() => setLoading(false));
  }, [assignmentId]);

  const questions: ExamQuestion[] = attempt?.questions?.map((item) => item.question) || [];
  const currentQuestion = questions[questionIndex];
  const visibleAssignments = assignmentId ? assignments : assignments.filter((assignment) => assignment.isStandalone);

  async function start(assignment: Assignment) {
    try {
      setResult(null);
      setAnswers({});
      setQuestionIndex(0);
      setDirection('next');
      setSecondsLeft((assignment.timeLimit || 45) * 60);
      setAttempt(await skillsApi.startAssignment(assignment.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start exam');
    }
  }

  async function submit(force = false) {
    if (!attempt || submitting) return;
    if (!force && Object.keys(answers).length !== questions.length) return toast.error('Answer every question before submitting.');
    setSubmitting(true);
    try {
      setResult(await skillsApi.submitAssignment(attempt.id, Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId }))));
      void queryClient.invalidateQueries({ queryKey: queryKeys.learningProfile });
      setAttempt(null);
      if (force) toast('Time is up. Your answered questions were submitted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit exam');
    } finally {
      setSubmitting(false);
    }
  }

  submitRef.current = () => { void submit(true); };

  useEffect(() => {
    if (!attempt) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          submitRef.current();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [attempt]);

  function showQuestion(index: number) {
    if (index < 0 || index >= questions.length) return;
    setDirection(index > questionIndex ? 'next' : 'previous');
    setQuestionIndex(index);
  }

  if (loading) return <div className="card grid min-h-72 place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;

  if (attempt && currentQuestion) return (
    <LearningLayout><div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-xl bg-slate-950 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">Exam in progress</p><h1 className="mt-2 text-2xl font-black">{attempt.assignment?.title || 'Course assessment'}</h1></div>
          <p className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-black ${secondsLeft <= 60 ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}><Clock3 size={16} /> {formatTime(secondsLeft)}</p>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
      </section>

      <div key={currentQuestion.id} className={`card ${direction === 'next' ? 'animate-[slideInRight_.25s_ease-out]' : 'animate-[slideInLeft_.25s_ease-out]'}`}>
        <p className="text-xs font-black uppercase tracking-wide text-neutral-400">Question {questionIndex + 1} of {questions.length}</p>
        <h2 className="mt-3 text-lg font-black">{currentQuestion.text}</h2>
        <div className="mt-5 space-y-2">
          {currentQuestion.options.map((option) => <label key={option.id} className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm font-semibold transition ${answers[currentQuestion.id] === option.id ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-700'}`}><input type="radio" name={currentQuestion.id} checked={answers[currentQuestion.id] === option.id} onChange={() => setAnswers((all) => ({ ...all, [currentQuestion.id]: option.id }))} />{option.text}</label>)}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => showQuestion(questionIndex - 1)} disabled={questionIndex === 0} className="btn-white rounded-lg disabled:opacity-40"><ArrowLeft size={16} /> Previous</button>
        <div className="flex flex-wrap justify-center gap-1.5">{questions.map((question, index) => <button key={question.id} onClick={() => showQuestion(index)} className={`h-3 w-3 rounded-full transition ${index === questionIndex ? 'bg-violet-600 ring-4 ring-violet-100' : answers[question.id] ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} aria-label={`Go to question ${index + 1}`} />)}</div>
        {questionIndex < questions.length - 1 ? <button onClick={() => showQuestion(questionIndex + 1)} className="btn-black rounded-lg">Next <ArrowRight size={16} /></button> : <button onClick={() => submit()} disabled={submitting} className="btn-black rounded-lg disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit exam'}</button>}
      </div>
    </div></LearningLayout>
  );

  return (
    <LearningLayout><div className="space-y-6">
      <section className="rounded-xl bg-slate-950 p-7 text-white"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">Assessments</p><h1 className="mt-2 text-3xl font-black">{assignmentId ? 'Course exam' : 'Standalone exams'}</h1><p className="mt-2 text-sm text-slate-300">Answer one question at a time. You can return to earlier questions before submitting.</p></section>
      {result && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"><p className="flex items-center gap-2 font-black"><CheckCircle2 size={18} /> Exam submitted</p><p className="mt-1 text-sm">Your score is {result.score}%.</p></div>}
      {visibleAssignments.length === 0 ? <div className="card py-12 text-center"><FileQuestion className="mx-auto text-neutral-300" size={36} /><p className="mt-3 font-black">No exams available yet</p></div> : visibleAssignments.map((assignment) => <article key={assignment.id} className="card flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-black">{assignment.title}</h2><p className="mt-1 flex items-center gap-3 text-sm text-neutral-500"><span className="flex items-center gap-1"><Clock3 size={14} />{assignment.timeLimit || 45} minutes</span><span>Pass mark {assignment.passingScore || 70}%</span></p></div><button onClick={() => start(assignment)} className="btn-black rounded-xl">Take exam</button></article>)}
    </div></LearningLayout>
  );
}
