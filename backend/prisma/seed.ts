import { PrismaClient, Role, Gender, StaffRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const passwordHash = await argon2.hash('password123');

  // ─── Hospital & Branch ────────────────────────────────────────────────────
  const hospital = await prisma.hospital.upsert({
    where: { id: 'hospital-001' },
    update: {},
    create: {
      id: 'hospital-001',
      name: 'MediCare General Hospital',
      address: '123 Health Street, Medical City, MC 10001',
      phone: '+1-800-MEDICARE',
      email: 'info@medicare-hospital.com',
      status: 'ACTIVE',
    },
  });

  const branch = await prisma.branch.upsert({
    where: { id: 'branch-001' },
    update: {},
    create: {
      id: 'branch-001',
      name: 'Main Campus',
      address: '123 Health Street, Medical City, MC 10001',
      phone: '+1-800-MEDICARE',
      hospitalId: hospital.id,
    },
  });

  // ─── Departments ──────────────────────────────────────────────────────────
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { id: 'dept-cardiology' },
      update: {},
      create: { id: 'dept-cardiology', name: 'Cardiology', branchId: branch.id },
    }),
    prisma.department.upsert({
      where: { id: 'dept-neurology' },
      update: {},
      create: { id: 'dept-neurology', name: 'Neurology', branchId: branch.id },
    }),
    prisma.department.upsert({
      where: { id: 'dept-orthopedics' },
      update: {},
      create: { id: 'dept-orthopedics', name: 'Orthopedics', branchId: branch.id },
    }),
    prisma.department.upsert({
      where: { id: 'dept-pediatrics' },
      update: {},
      create: { id: 'dept-pediatrics', name: 'Pediatrics', branchId: branch.id },
    }),
    prisma.department.upsert({
      where: { id: 'dept-emergency' },
      update: {},
      create: { id: 'dept-emergency', name: 'Emergency Medicine', branchId: branch.id },
    }),
    prisma.department.upsert({
      where: { id: 'dept-radiology' },
      update: {},
      create: { id: 'dept-radiology', name: 'Radiology', branchId: branch.id },
    }),
    prisma.department.upsert({
      where: { id: 'dept-pharmacy' },
      update: {},
      create: { id: 'dept-pharmacy', name: 'Pharmacy', branchId: branch.id },
    }),
    prisma.department.upsert({
      where: { id: 'dept-laboratory' },
      update: {},
      create: { id: 'dept-laboratory', name: 'Laboratory', branchId: branch.id },
    }),
  ]);

  console.log(`✅ Created hospital, branch, and ${departments.length} departments`);

  // ─── Super Admin ──────────────────────────────────────────────────────────
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@hms.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'superadmin@hms.com',
      password: passwordHash,
      role: Role.SUPER_ADMIN,
      emailVerified: true,
    },
  });
  console.log(`✅ Super Admin: superadmin@hms.com`);

  // ─── Admin ────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hms.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'admin@hms.com',
      password: passwordHash,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });
  console.log(`✅ Admin: admin@hms.com`);

  // ─── Doctors ──────────────────────────────────────────────────────────────
  const doctor1User = await prisma.user.upsert({
    where: { email: 'dr.smith@hms.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'dr.smith@hms.com',
      password: passwordHash,
      role: Role.DOCTOR,
      emailVerified: true,
    },
  });
  await prisma.doctor.upsert({
    where: { userId: doctor1User.id },
    update: {},
    create: {
      userId: doctor1User.id,
      fullName: 'Dr. James Smith',
      specialization: 'Cardiologist',
      departmentId: 'dept-cardiology',
      branchId: branch.id,
      qualifications: 'MBBS, MD (Cardiology), FACC',
      experience: 15,
      registrationNo: 'MCI-2024-001',
      professionalBio: 'Dr. James Smith is a board-certified cardiologist with 15 years of experience in interventional cardiology.',
      consultationFee: 1500,
      verificationStatus: 'VERIFIED',
    },
  });

  const doctor2User = await prisma.user.upsert({
    where: { email: 'dr.patel@hms.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'dr.patel@hms.com',
      password: passwordHash,
      role: Role.DOCTOR,
      emailVerified: true,
    },
  });
  await prisma.doctor.upsert({
    where: { userId: doctor2User.id },
    update: {},
    create: {
      userId: doctor2User.id,
      fullName: 'Dr. Priya Patel',
      specialization: 'Neurologist',
      departmentId: 'dept-neurology',
      branchId: branch.id,
      qualifications: 'MBBS, DM (Neurology)',
      experience: 10,
      registrationNo: 'MCI-2024-002',
      professionalBio: 'Dr. Priya Patel specializes in treating neurological disorders including epilepsy, stroke, and Parkinson\'s disease.',
      consultationFee: 1200,
      verificationStatus: 'VERIFIED',
    },
  });

  console.log(`✅ Created 2 doctors`);

  // ─── Nurses ───────────────────────────────────────────────────────────────
  const nurse1User = await prisma.user.upsert({
    where: { email: 'nurse.johnson@hms.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'nurse.johnson@hms.com',
      password: passwordHash,
      role: Role.NURSE,
      emailVerified: true,
    },
  });
  await prisma.staff.upsert({
    where: { employeeId: 'EMP-NURSE-001' },
    update: {},
    create: {
      userId: nurse1User.id,
      fullName: 'Sarah Johnson',
      employeeId: 'EMP-NURSE-001',
      role: StaffRole.NURSE,
      departmentId: 'dept-cardiology',
      branchId: branch.id,
      qualification: 'BSc Nursing, Registered Nurse (RN)',
      shift: 'Morning',
      workingHours: '08:00-16:00',
    },
  });

  const nurse2User = await prisma.user.upsert({
    where: { email: 'nurse.chen@hms.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'nurse.chen@hms.com',
      password: passwordHash,
      role: Role.NURSE,
      emailVerified: true,
    },
  });
  await prisma.staff.upsert({
    where: { employeeId: 'EMP-NURSE-002' },
    update: {},
    create: {
      userId: nurse2User.id,
      fullName: 'Linda Chen',
      employeeId: 'EMP-NURSE-002',
      role: StaffRole.NURSE,
      departmentId: 'dept-emergency',
      branchId: branch.id,
      qualification: 'BSc Nursing, Critical Care Certification',
      shift: 'Evening',
      workingHours: '16:00-00:00',
    },
  });

  console.log(`✅ Created 2 nurses`);

  // ─── Receptionists ────────────────────────────────────────────────────────
  const receptionist1User = await prisma.user.upsert({
    where: { email: 'reception.davis@hms.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'reception.davis@hms.com',
      password: passwordHash,
      role: Role.RECEPTIONIST,
      emailVerified: true,
    },
  });
  await prisma.staff.upsert({
    where: { employeeId: 'EMP-RECEPT-001' },
    update: {},
    create: {
      userId: receptionist1User.id,
      fullName: 'Emily Davis',
      employeeId: 'EMP-RECEPT-001',
      role: StaffRole.RECEPTIONIST,
      branchId: branch.id,
      qualification: 'BBA, Hospital Administration Diploma',
      shift: 'Morning',
      workingHours: '08:00-16:00',
    },
  });

  console.log(`✅ Created 1 receptionist`);

  // ─── Lab Technicians ──────────────────────────────────────────────────────
  const labTechUser = await prisma.user.upsert({
    where: { email: 'lab.wilson@hms.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'lab.wilson@hms.com',
      password: passwordHash,
      role: Role.LAB_TECHNICIAN,
      emailVerified: true,
    },
  });
  await prisma.staff.upsert({
    where: { employeeId: 'EMP-LAB-001' },
    update: {},
    create: {
      userId: labTechUser.id,
      fullName: 'Robert Wilson',
      employeeId: 'EMP-LAB-001',
      role: StaffRole.LAB_TECHNICIAN,
      departmentId: 'dept-laboratory',
      branchId: branch.id,
      qualification: 'BSc Medical Laboratory Technology',
      shift: 'Morning',
      workingHours: '08:00-16:00',
    },
  });

  console.log(`✅ Created 1 lab technician`);

  // ─── Pharmacist ───────────────────────────────────────────────────────────
  const pharmacistUser = await prisma.user.upsert({
    where: { email: 'pharmacy.brown@hms.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'pharmacy.brown@hms.com',
      password: passwordHash,
      role: Role.PHARMACIST,
      emailVerified: true,
    },
  });
  await prisma.staff.upsert({
    where: { employeeId: 'EMP-PHARM-001' },
    update: {},
    create: {
      userId: pharmacistUser.id,
      fullName: 'Michael Brown',
      employeeId: 'EMP-PHARM-001',
      role: StaffRole.PHARMACIST,
      departmentId: 'dept-pharmacy',
      branchId: branch.id,
      qualification: 'Pharm.D, Registered Pharmacist',
      shift: 'Morning',
      workingHours: '09:00-17:00',
    },
  });

  console.log(`✅ Created 1 pharmacist`);

  // ─── Billing Staff ────────────────────────────────────────────────────────
  const billingUser = await prisma.user.upsert({
    where: { email: 'billing.martinez@hms.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'billing.martinez@hms.com',
      password: passwordHash,
      role: Role.BILLING_STAFF,
      emailVerified: true,
    },
  });
  await prisma.staff.upsert({
    where: { employeeId: 'EMP-BILL-001' },
    update: {},
    create: {
      userId: billingUser.id,
      fullName: 'Maria Martinez',
      employeeId: 'EMP-BILL-001',
      role: StaffRole.BILLING_STAFF,
      branchId: branch.id,
      qualification: 'BCom, Medical Billing Certification',
      shift: 'Morning',
      workingHours: '09:00-17:00',
    },
  });

  console.log(`✅ Created 1 billing staff`);

  // ─── Patients ─────────────────────────────────────────────────────────────
  const patient1User = await prisma.user.upsert({
    where: { email: 'patient.john@example.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'patient.john@example.com',
      password: passwordHash,
      role: Role.PATIENT,
      emailVerified: true,
    },
  });
  await prisma.patient.upsert({
    where: { userId: patient1User.id },
    update: {},
    create: {
      userId: patient1User.id,
      fullName: 'John Anderson',
      dateOfBirth: new Date('1985-03-15'),
      gender: Gender.MALE,
      phone: '+1-555-0101',
      email: 'patient.john@example.com',
      address: '456 Oak Avenue, Springfield, SP 12345',
      emergencyName: 'Mary Anderson',
      emergencyPhone: '+1-555-0102',
      bloodGroup: 'O+',
    },
  });

  const patient2User = await prisma.user.upsert({
    where: { email: 'patient.sarah@example.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'patient.sarah@example.com',
      password: passwordHash,
      role: Role.PATIENT,
      emailVerified: true,
    },
  });
  await prisma.patient.upsert({
    where: { userId: patient2User.id },
    update: {},
    create: {
      userId: patient2User.id,
      fullName: 'Sarah Thompson',
      dateOfBirth: new Date('1992-07-22'),
      gender: Gender.FEMALE,
      phone: '+1-555-0201',
      email: 'patient.sarah@example.com',
      address: '789 Maple Street, Riverside, RV 67890',
      emergencyName: 'Tom Thompson',
      emergencyPhone: '+1-555-0202',
      bloodGroup: 'A+',
    },
  });

  const patient3User = await prisma.user.upsert({
    where: { email: 'patient.ravi@example.com' },
    update: { password: passwordHash, emailVerified: true, status: 'ACTIVE' },
    create: {
      email: 'patient.ravi@example.com',
      password: passwordHash,
      role: Role.PATIENT,
      emailVerified: true,
    },
  });
  await prisma.patient.upsert({
    where: { userId: patient3User.id },
    update: {},
    create: {
      userId: patient3User.id,
      fullName: 'Ravi Kumar',
      dateOfBirth: new Date('1978-11-05'),
      gender: Gender.MALE,
      phone: '+91-98765-43210',
      email: 'patient.ravi@example.com',
      address: 'Plot 12, Sector 14, New Delhi, 110001',
      bloodGroup: 'B+',
    },
  });

  console.log(`✅ Created 3 patients`);

  // ─── Doctor Availabilities ────────────────────────────────────────────────
  const doctor1 = await prisma.doctor.findUnique({ where: { userId: doctor1User.id } });
  if (doctor1) {
    await prisma.doctorAvailability.createMany({
      data: [1, 2, 3, 4, 5].map((day) => ({
        doctorId: doctor1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        isAvailable: true,
      })),
      skipDuplicates: true,
    });
    console.log(`✅ Created availability schedule for Dr. Smith`);
  }

  // ─── Medications ──────────────────────────────────────────────────────────
  const medications = [
    { name: 'Aspirin 75mg', genericName: 'Aspirin', category: 'Antiplatelet', unit: 'Tablet', stock: 500, price: 5.0 },
    { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Antidiabetic', unit: 'Tablet', stock: 300, price: 8.5 },
    { name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: 'Antihypertensive', unit: 'Tablet', stock: 250, price: 12.0 },
    { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'Statin', unit: 'Tablet', stock: 200, price: 15.0 },
    { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Analgesic', unit: 'Tablet', stock: 1000, price: 3.5 },
    { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', unit: 'Capsule', stock: 400, price: 18.0 },
    { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Proton Pump Inhibitor', unit: 'Capsule', stock: 350, price: 10.0 },
    { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', category: 'Bronchodilator', unit: 'Inhaler', stock: 100, price: 150.0 },
  ];

  for (const med of medications) {
    const existing = await prisma.medication.findFirst({ where: { name: med.name } });
    if (!existing) {
      await prisma.medication.create({ data: med });
    }
  }
  console.log(`✅ Created ${medications.length} medications`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Demo Login Credentials (password: password123)');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Super Admin  : superadmin@hms.com');
  console.log('  Admin        : admin@hms.com');
  console.log('  Doctor       : dr.smith@hms.com | dr.patel@hms.com');
  console.log('  Nurse        : nurse.johnson@hms.com | nurse.chen@hms.com');
  console.log('  Receptionist : reception.davis@hms.com');
  console.log('  Lab Tech     : lab.wilson@hms.com');
  console.log('  Pharmacist   : pharmacy.brown@hms.com');
  console.log('  Billing      : billing.martinez@hms.com');
  console.log('  Patient      : patient.john@example.com');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
