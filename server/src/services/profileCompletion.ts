import type { Student } from "@prisma/client";

const WEIGHTED_FIELDS: Array<[keyof Student, number]> = [
  ["dob", 5],
  ["gender", 5],
  ["phone", 8],
  ["address", 8],
  ["cgpa", 10],
  ["tenthPercent", 8],
  ["twelfthPercent", 8],
  ["resumeUrl", 15],
  ["linkedinUrl", 6],
  ["githubUrl", 6],
  ["portfolioUrl", 6],
  ["projects", 8],
  ["internships", 7],
];

export function computeProfileCompletion(student: Student): number {
  let score = 15; // base for having registered with required academic fields
  for (const [field, weight] of WEIGHTED_FIELDS) {
    const value = student[field];
    if (value !== null && value !== undefined && value !== "") score += weight;
  }
  if (student.skills.length > 0) score += 5;
  return Math.min(100, Math.round(score));
}
