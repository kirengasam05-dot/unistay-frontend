import type { Role } from '../types';

export const users = [
  { id:'u-student', fullName:'Aline Student', email:'student@unistay.com', phone:'+250 788 000 001', password:'password123', role:'STUDENT' as Role, location:'Kigali', skillsProfile:'React, communication, digital literacy', profileScore:72 },
  { id:'u-host', fullName:'Eric Host', email:'host@unistay.com', phone:'+250 788 000 002', password:'password123', role:'HOST' as Role, location:'Kacyiru', skillsProfile:'Property management' },
  { id:'u-employer', fullName:'Mutesi Employer', email:'employer@unistay.com', phone:'+250 788 000 003', password:'password123', role:'EMPLOYER' as Role, location:'Kigali', skillsProfile:'Hiring and training' },
  { id:'u-admin', fullName:'Admin Manager', email:'admin@unistay.com', phone:'+250 788 000 004', password:'password123', role:'ADMIN' as Role, location:'Kigali', skillsProfile:'Platform administration' },
];

export const housings = [
  { id:'h1', title:'Kacyiru Student Residence', location:'Kacyiru, Kigali', price:180000, availability:true, verificationStatus:'VERIFIED', hostId:'u-host', image:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80' },
  { id:'h2', title:'Remera Shared Apartment', location:'Remera, Kigali', price:120000, availability:true, verificationStatus:'VERIFIED', hostId:'u-host', image:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80' },
  { id:'h3', title:'Kimironko Private Studio', location:'Kimironko, Kigali', price:220000, availability:false, verificationStatus:'PENDING', hostId:'u-host', image:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
];

export const jobs = [
  {
    id:'j1',
    title:'Frontend Developer Internship',
    company:'Kigali Tech Hub',
    location:'Kigali / Hybrid',
    salary:150000,
    scheduleType:'INTERNSHIP',
    employerId:'u-employer',
    category:'Software Development',
    deadline:'2026-06-15',
    requiredCourseIds:['c1'],
    requiredSkills:['React','TypeScript','Communication'],
    requirements:['Complete React Fundamentals course','Pass React Practical Exam with at least 70%','Basic Git and responsive UI knowledge','Available 20 hours per week']
  },
  {
    id:'j2',
    title:'Digital Marketing Internship',
    company:'Student Brands Rwanda',
    location:'Remera, Kigali',
    salary:120000,
    scheduleType:'INTERNSHIP',
    employerId:'u-employer',
    category:'Marketing',
    deadline:'2026-06-20',
    requiredCourseIds:['c2'],
    requiredSkills:['Communication','Content writing','Social media'],
    requirements:['Complete Professional Communication course','Submit short campaign assignment','Strong written English','Available afternoons']
  },
  {
    id:'j3',
    title:'Campus Sales Assistant',
    company:'UniStay Partner Stores',
    location:'Nyamirambo',
    salary:100000,
    scheduleType:'PART_TIME',
    employerId:'u-employer',
    category:'Sales & Communication',
    deadline:'2026-06-30',
    requiredCourseIds:['c2'],
    requiredSkills:['Communication','Customer care'],
    requirements:['Good communication skills','Customer care experience is a plus','Evening availability','Student ID required']
  },
  {
    id:'j4',
    title:'Data Entry Assistant',
    company:'Remote Admin Services',
    location:'Remote',
    salary:90000,
    scheduleType:'PART_TIME',
    employerId:'u-employer',
    category:'Administration',
    deadline:'2026-07-05',
    requiredCourseIds:['c3'],
    requiredSkills:['Excel','Accuracy','Time management'],
    requirements:['Complete Personal Finance or Excel basics module','Accuracy above 80% in sample test','Reliable internet connection','Flexible evening schedule']
  },
];

export const courses = [
  { id:'c1', title:'React Fundamentals for Student Jobs', description:'Learn React basics, components, props, state and project structure used in real internships.', category:'Digital Skills', progress:80, isPublished:true, thumbnail:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', materials:4, exam:'React Practical Exam', certificateAvailable:true },
  { id:'c2', title:'Professional Communication', description:'Build workplace communication, interview confidence and professional email writing skills.', category:'Communication', progress:45, isPublished:true, thumbnail:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80', materials:3, exam:'Communication Assessment', certificateAvailable:false },
  { id:'c3', title:'Personal Finance for Students', description:'Understand budgeting, savings, tracking income and responsible financial planning.', category:'Finance', progress:20, isPublished:false, thumbnail:'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80', materials:2, exam:'Finance Quiz', certificateAvailable:false },
];

export const applications = [
  { id:'a1', jobId:'j1', student:'Aline Student', email:'student@unistay.com', score:92, status:'PENDING', compatible:true, missing:[] },
  { id:'a2', jobId:'j2', student:'Claude Student', email:'claude@example.com', score:48, status:'PENDING', compatible:false, missing:['Customer care','Evening availability'] },
];

export const notifications = [
  { id:'n1', title:'Housing availability update', body:'Kacyiru Student Residence is available for booking.', type:'housing' },
  { id:'n2', title:'Course progress', body:'Complete your React course exam to unlock certificate.', type:'skills' },
  { id:'n3', title:'Job application result', body:'Your application status will be sent by email after employer review.', type:'jobs' },
];

export const emails = [
  { id:'e1', subject:'Booking request received', from:'bookings@unistay.com', body:'Your booking request is pending host confirmation before payment.' },
  { id:'e2', subject:'Application review pending', from:'jobs@unistay.com', body:'Your job application is waiting for employer compatibility review.' },
];


export const assignments = [
  { id:'as1', title:'React Practical Exam', courseId:'c1', skillId:'skill-react', timeLimit:45, questionCount:15, passingScore:70, status:'NOT_STARTED' },
  { id:'as2', title:'Communication Skills Assessment', courseId:'c2', skillId:'skill-communication', timeLimit:30, questionCount:10, passingScore:75, status:'IN_PROGRESS' },
  { id:'as3', title:'Finance Quiz for Students', courseId:'c3', skillId:'skill-finance', timeLimit:25, questionCount:12, passingScore:70, status:'NOT_STARTED' },
];

export const certificates = [
  { id:'cert-1', userId:'u-student', courseId:'c1', title:'Frontend Development Certificate', issuedAt:'Pending exam completion', certificateUrl:'#' },
  { id:'cert-2', userId:'u-student', courseId:'c2', title:'Professional Communication Certificate', issuedAt:'Pending completion', certificateUrl:'#' },
];
