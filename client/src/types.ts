export type Role = "STUDENT" | "TPO" | "ADMIN";

export interface Institute {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  programs?: Program[];
}

export interface Program {
  id: string;
  name: string;
  instituteId: string;
  departments?: Department[];
}

export interface Department {
  id: string;
  name: string;
  programId: string;
}

export interface Student {
  id: string;
  userId: string;
  fullName: string;
  enrollmentNo: string;
  dob?: string | null;
  gender?: string | null;
  phone?: string | null;
  address?: string | null;
  instituteId: string;
  institute?: Institute;
  programId: string;
  program?: Program;
  departmentId: string;
  department?: Department;
  batch: string;
  semester?: number | null;
  graduationYear: number;
  cgpa?: number | null;
  tenthPercent?: number | null;
  twelfthPercent?: number | null;
  diplomaPercent?: number | null;
  backlogs: number;
  resumeUrl?: string | null;
  skills: string[];
  certifications: string[];
  projects?: string | null;
  internships?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  profileCompletionPercent: number;
  documents?: DocumentRecord[];
}

export interface DocumentRecord {
  id: string;
  type: string;
  fileName: string;
  status: "UPLOADED" | "VERIFIED" | "REJECTED";
  uploadedAt: string;
  reviewNote?: string | null;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
  industry?: string | null;
  website?: string | null;
  description?: string | null;
  drives?: Drive[];
}

export interface Drive {
  id: string;
  companyId: string;
  company?: Company;
  jobRole: string;
  packageMin?: number | null;
  packageMax?: number | null;
  location?: string | null;
  workMode: "ONSITE" | "REMOTE" | "HYBRID";
  minCgpa?: number | null;
  maxBacklogs?: number | null;
  applicationStart: string;
  applicationEnd: string;
  driveDate?: string | null;
  jobDescription: string;
  requiredSkills: string[];
  requiredDocuments: string[];
  selectionProcess?: string | null;
  status: "UPCOMING" | "OPEN" | "CLOSED" | "COMPLETED";
  eligibility?: any[];
  rounds?: { id: string; name: string; sequence: number }[];
}

export interface Application {
  id: string;
  studentId: string;
  driveId: string;
  drive?: Drive;
  status:
    | "APPLIED"
    | "SHORTLISTED"
    | "APTITUDE_TEST"
    | "TECHNICAL_ROUND"
    | "HR_ROUND"
    | "SELECTED"
    | "REJECTED"
    | "WAITLISTED"
    | "WITHDRAWN";
  appliedAt: string;
  history?: { status: string; changedAt: string; note?: string | null }[];
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "NORMAL" | "HIGH";
  createdAt: string;
}

export interface PlacementStatistic {
  id: string;
  academicYear: string;
  studentsPlaced: number;
  totalOffers: number;
  recruiterCount: number;
  highestPackage?: number | null;
  averagePackage?: number | null;
  medianPackage?: number | null;
  eligibleStudents: number;
  isDemoData: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  status?: string;
  student?: Student | null;
  staffProfile?: { fullName: string; designation: string } | null;
}
