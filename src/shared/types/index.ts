export type Role = 'STUDENT' | 'HOST' | 'EMPLOYER' | 'INSTRUCTOR' | 'ADMIN';
export type User = { id:string; fullName:string; email:string; phone?:string; password?:string; role:Role; location?:string; skillsProfile?:string; profileScore?:number };
