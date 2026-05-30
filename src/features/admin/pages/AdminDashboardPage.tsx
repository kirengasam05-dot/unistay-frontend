import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { usersApi } from '../../users/usersApi';
import { housingApi } from '../../housing/housingApi';
import { jobsApi } from '../../jobs/jobsApi';
import { coursesApi } from '../../courses/coursesApi';
import type { Housing } from '../../../types/api';

export default function AdminDashboardPage() {
  const [userCount, setUserCount]     = useState<number | null>(null);
  const [housings, setHousings]       = useState<Housing[]>([]);
  const [jobCount, setJobCount]       = useState<number | null>(null);
  const [courseCount, setCourseCount] = useState<number | null>(null);

  useEffect(() => {
    usersApi.list().then(u => setUserCount(u.length)).catch(() => setUserCount(0));
    housingApi.getAll().then(setHousings).catch(() => setHousings([]));
    jobsApi.getAll().then(j => setJobCount(j.length)).catch(() => setJobCount(0));
    coursesApi.getAll().then(c => setCourseCount(c.length)).catch(() => setCourseCount(0));
  }, []);

  const stat = (n: number | null) => n === null ? <Loader2 size={16} className="animate-spin inline" /> : n;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-neutral-500">Users</p><h2 className="text-3xl font-black">{stat(userCount)}</h2></Card>
        <Card><p className="text-sm text-neutral-500">Housing</p><h2 className="text-3xl font-black">{stat(housings.length || null)}</h2></Card>
        <Card><p className="text-sm text-neutral-500">Jobs</p><h2 className="text-3xl font-black">{stat(jobCount)}</h2></Card>
        <Card><p className="text-sm text-neutral-500">Courses</p><h2 className="text-3xl font-black">{stat(courseCount)}</h2></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-black">Quick links</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Manage all platform areas from one place.</p>
          <div className="mt-4 grid gap-3">
            <a href="/admin/users" className="input text-center font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800">Manage Users &amp; Roles</a>
            <a href="/admin/learning" className="input text-center font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800">Manage Courses &amp; Exams</a>
            <a href="/admin/moderation" className="input text-center font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800">Housing Moderation</a>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Housing verification</h2>
          {housings.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No housing listings found.</p>
          ) : (
            housings.filter(h => h.verificationStatus === 'PENDING').slice(0, 5).map(h => (
              <div className="mb-3 flex items-center justify-between rounded-2xl border p-3 dark:border-neutral-700" key={h.id}>
                <div>
                  <b className="text-neutral-900 dark:text-white">{h.title}</b>
                  <p className="text-sm text-neutral-500">{h.location}</p>
                </div>
                <div className="flex gap-2">
                  <Badge>{h.verificationStatus}</Badge>
                  <Button variant="green" onClick={() => housingApi.setVerification(h.id, 'VERIFIED').then(() => setHousings(prev => prev.map(x => x.id === h.id ? { ...x, verificationStatus: 'VERIFIED' as const } : x)))}>Verify</Button>
                  <Button variant="red" onClick={() => housingApi.setVerification(h.id, 'REJECTED').then(() => setHousings(prev => prev.map(x => x.id === h.id ? { ...x, verificationStatus: 'REJECTED' as const } : x)))}>Reject</Button>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
