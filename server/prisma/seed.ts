import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 12);
}

async function main() {
  console.log("Seeding AGI Placement Portal database...");

  // -------------------------------------------------------------------------
  // Institutes — official names/addresses sourced from aimsr.edu.in and acaad.edu.in
  // -------------------------------------------------------------------------
  const aimsr = await prisma.institute.upsert({
    where: { code: "AIMSR" },
    update: {},
    create: {
      name: "Aditya Institute of Management Technology and Research (AIMSR)",
      code: "AIMSR",
      address: "Aditya Educational Campus, R.M. Bhattad Road, Ram Nagar, Borivali (West), Mumbai - 400092",
      email: "admissions@aimsr.edu.in",
      phone: "022-3520 6111",
    },
  });

  const acaad = await prisma.institute.upsert({
    where: { code: "ACAAD" },
    update: {},
    create: {
      name: "Aditya College of Art, Architecture and Design (ACAAD)",
      code: "ACAAD",
      address: "Aditya Educational Campus, R.M. Bhattad Road, Ram Nagar, Borivali (West), Mumbai - 400092",
      email: "info@acaad.edu.in",
      phone: "022-3520 6111",
    },
  });

  const bms = await prisma.program.upsert({ where: { instituteId_name: { instituteId: aimsr.id, name: "Bachelor of Management Studies (BMS)" } }, update: {}, create: { name: "Bachelor of Management Studies (BMS)", instituteId: aimsr.id } });
  const mms = await prisma.program.upsert({ where: { instituteId_name: { instituteId: aimsr.id, name: "Master of Management Studies (MMS)" } }, update: {}, create: { name: "Master of Management Studies (MMS)", instituteId: aimsr.id } });
  const mca = await prisma.program.upsert({ where: { instituteId_name: { instituteId: aimsr.id, name: "Master of Computer Applications (MCA)" } }, update: {}, create: { name: "Master of Computer Applications (MCA)", instituteId: aimsr.id } });
  const barch = await prisma.program.upsert({ where: { instituteId_name: { instituteId: acaad.id, name: "Bachelor of Architecture (B.Arch)" } }, update: {}, create: { name: "Bachelor of Architecture (B.Arch)", instituteId: acaad.id } });
  const bdes = await prisma.program.upsert({ where: { instituteId_name: { instituteId: acaad.id, name: "Bachelor of Design (B.Des)" } }, update: {}, create: { name: "Bachelor of Design (B.Des)", instituteId: acaad.id } });

  const mmsFinance = await prisma.department.upsert({ where: { programId_name: { programId: mms.id, name: "Finance" } }, update: {}, create: { name: "Finance", programId: mms.id } });
  const mmsMarketing = await prisma.department.upsert({ where: { programId_name: { programId: mms.id, name: "Marketing" } }, update: {}, create: { name: "Marketing", programId: mms.id } });
  const mcaGeneral = await prisma.department.upsert({ where: { programId_name: { programId: mca.id, name: "Computer Applications" } }, update: {}, create: { name: "Computer Applications", programId: mca.id } });
  const bmsGeneral = await prisma.department.upsert({ where: { programId_name: { programId: bms.id, name: "General Management" } }, update: {}, create: { name: "General Management", programId: bms.id } });
  const barchGeneral = await prisma.department.upsert({ where: { programId_name: { programId: barch.id, name: "Architecture" } }, update: {}, create: { name: "Architecture", programId: barch.id } });
  const bdesInterior = await prisma.department.upsert({ where: { programId_name: { programId: bdes.id, name: "Interior Design" } }, update: {}, create: { name: "Interior Design", programId: bdes.id } });

  // -------------------------------------------------------------------------
  // Admin & TPO accounts (demo credentials — rotate before production use)
  // -------------------------------------------------------------------------
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@agiplacements.demo" },
    update: {},
    create: {
      email: "admin@agiplacements.demo",
      passwordHash: await hash("AgiAdmin@123"),
      role: "ADMIN",
      status: "ACTIVE",
      staffProfile: {
        create: { fullName: "Placement System Administrator", designation: "System Administrator", instituteId: aimsr.id, isPublicTeamMember: false },
      },
    },
  });

  const tpoUser = await prisma.user.upsert({
    where: { email: "tpo@agiplacements.demo" },
    update: {},
    create: {
      email: "tpo@agiplacements.demo",
      passwordHash: await hash("AgiTpo@123"),
      role: "TPO",
      status: "ACTIVE",
      staffProfile: {
        create: { fullName: "Data to be updated", designation: "Training & Placement Officer", instituteId: aimsr.id, phone: "Data to be updated", isPublicTeamMember: true },
      },
    },
  });

  // -------------------------------------------------------------------------
  // Demo students (clearly demo — replace with real registrations)
  // -------------------------------------------------------------------------
  const demoStudents = [
    { fullName: "Demo Student One", enrollmentNo: "AIMSR-MMS-24-001", email: "student1@agiplacements.demo", programId: mms.id, departmentId: mmsFinance.id, batch: "2024-26", graduationYear: 2026, cgpa: 8.4, tenthPercent: 88, twelfthPercent: 84, backlogs: 0, verificationStatus: "VERIFIED" as const },
    { fullName: "Demo Student Two", enrollmentNo: "AIMSR-MCA-24-002", email: "student2@agiplacements.demo", programId: mca.id, departmentId: mcaGeneral.id, batch: "2024-27", graduationYear: 2027, cgpa: 7.6, tenthPercent: 79, twelfthPercent: 81, backlogs: 1, verificationStatus: "PENDING" as const },
    { fullName: "Demo Student Three", enrollmentNo: "ACAAD-BARCH-22-003", email: "student3@agiplacements.demo", programId: barch.id, departmentId: barchGeneral.id, batch: "2022-27", graduationYear: 2027, cgpa: 8.9, tenthPercent: 91, twelfthPercent: 89, backlogs: 0, verificationStatus: "VERIFIED" as const },
  ];

  for (const s of demoStudents) {
    const instituteId = s.enrollmentNo.startsWith("ACAAD") ? acaad.id : aimsr.id;
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: await hash("Student@123"),
        role: "STUDENT",
        status: "ACTIVE",
        student: {
          create: {
            fullName: s.fullName,
            enrollmentNo: s.enrollmentNo,
            instituteId,
            programId: s.programId,
            departmentId: s.departmentId,
            batch: s.batch,
            graduationYear: s.graduationYear,
            cgpa: s.cgpa,
            tenthPercent: s.tenthPercent,
            twelfthPercent: s.twelfthPercent,
            backlogs: s.backlogs,
            verificationStatus: s.verificationStatus,
            profileCompletionPercent: 55,
            skills: ["Communication", "MS Excel"],
          },
        },
      },
    });
  }

  // -------------------------------------------------------------------------
  // Demo companies & drive
  // -------------------------------------------------------------------------
  const demoCompany = await prisma.company.upsert({
    where: { name: "Demo Recruiter Pvt. Ltd." },
    update: {},
    create: { name: "Demo Recruiter Pvt. Ltd.", industry: "Information Technology (Demo)", website: "https://example.com", description: "Placeholder recruiter used for demonstrating the placement workflow. Replace with verified corporate partner data." },
  });

  const existingDrive = await prisma.drive.findFirst({ where: { companyId: demoCompany.id } });
  if (!existingDrive) {
    await prisma.drive.create({
      data: {
        companyId: demoCompany.id,
        jobRole: "Management Trainee (Demo)",
        packageMin: 4.5,
        packageMax: 6.5,
        location: "Mumbai",
        workMode: "HYBRID",
        minCgpa: 7.0,
        maxBacklogs: 1,
        applicationStart: new Date(),
        applicationEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        jobDescription: "This is placeholder demo job description content for demonstrating the placement drive workflow end-to-end.",
        requiredSkills: ["Communication", "MS Excel", "Analytical Thinking"],
        requiredDocuments: ["RESUME", "PHOTOGRAPH", "ID_PROOF"],
        selectionProcess: "Aptitude Test -> Group Discussion -> HR Interview",
        status: "OPEN",
        publishedAt: new Date(),
        eligibility: { create: [{ instituteId: aimsr.id, programId: mms.id }] },
        rounds: {
          create: [
            { name: "Aptitude Test", sequence: 1 },
            { name: "Group Discussion", sequence: 2 },
            { name: "HR Interview", sequence: 3 },
          ],
        },
      },
    });
  }

  // Placement policy placeholders
  const policySections = ["Student Eligibility", "Registration Guidelines", "Placement Drive Rules", "Attendance", "Selection Process", "Offer Acceptance", "Code of Conduct", "Important Instructions"];
  for (const section of policySections) {
    await prisma.placementPolicy.upsert({
      where: { section },
      update: {},
      create: { section, content: "Official placement policy will be published here." },
    });
  }

  console.log("Seed complete.");
  console.log("Demo admin login: admin@agiplacements.demo / AgiAdmin@123");
  console.log("Demo TPO login: tpo@agiplacements.demo / AgiTpo@123");
  console.log("Demo student logins: student1@agiplacements.demo, student2@agiplacements.demo, student3@agiplacements.demo / Student@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
