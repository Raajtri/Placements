import { prisma } from "../config/db";
import type { Student, Drive, DriveEligibility } from "@prisma/client";

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

// Server-side eligibility check — this is the source of truth. The frontend may render
// a hint, but every application-creation request re-runs this before accepting the apply.
export async function checkEligibility(student: Student, drive: Drive & { eligibility: DriveEligibility[] }): Promise<EligibilityResult> {
  const reasons: string[] = [];

  const scopeMatches = drive.eligibility.some((rule) => {
    if (rule.instituteId !== student.instituteId) return false;
    if (rule.programId && rule.programId !== student.programId) return false;
    if (rule.departmentId && rule.departmentId !== student.departmentId) return false;
    if (rule.batch && rule.batch !== student.batch) return false;
    return true;
  });

  if (drive.eligibility.length > 0 && !scopeMatches) {
    reasons.push("This drive is not open to your institute/program/department/batch.");
  }

  if (drive.minCgpa != null) {
    if (student.cgpa == null) reasons.push("Your CGPA is not recorded on your profile.");
    else if (student.cgpa < drive.minCgpa) reasons.push(`Minimum CGPA required is ${drive.minCgpa}, your recorded CGPA is ${student.cgpa}.`);
  }

  if (drive.maxBacklogs != null && student.backlogs > drive.maxBacklogs) {
    reasons.push(`Maximum allowed backlogs is ${drive.maxBacklogs}, you have ${student.backlogs}.`);
  }

  if (student.verificationStatus !== "VERIFIED") {
    reasons.push("Your profile must be verified by the Placement Cell before you can apply.");
  }

  const now = new Date();
  if (now < drive.applicationStart) reasons.push("Applications for this drive have not opened yet.");
  if (now > drive.applicationEnd) reasons.push("The application deadline for this drive has passed.");
  if (drive.status !== "OPEN") reasons.push(`This drive is currently ${drive.status.toLowerCase()}.`);

  return { eligible: reasons.length === 0, reasons };
}

export async function getDriveWithEligibility(driveId: string) {
  return prisma.drive.findUnique({ where: { id: driveId }, include: { eligibility: true, company: true, rounds: { orderBy: { sequence: "asc" } } } });
}
