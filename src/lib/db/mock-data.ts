import {
  Provider,
  Course,
  Trainee,
  Employer,
  TrainingRecord,
  EmploymentOutcome,
  VerificationRequest,
  FollowupTouchpoint,
  SkillGapSignal,
  AuditLog,
  OutcomeType,
  VerificationStatus
} from "../types";

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: "prov-1",
    name: "Maharashtra Advanced Skill Institute (MASI)",
    district: "Pune",
    contactEmail: "contact@masi-pune.org.in",
    placementRate: 84.5,
    verifiedPlacementRate: 78.2,
    retentionRate6m: 81.0,
    retentionRate12m: 74.5,
    totalTrainees: 420,
    verified: true,
    performanceScore: 89.2,
  },
  {
    id: "prov-2",
    name: "Mumbai Technical & Digital Academy",
    district: "Mumbai",
    contactEmail: "skills@mumbaitech.edu.in",
    placementRate: 88.0,
    verifiedPlacementRate: 82.5,
    retentionRate6m: 85.0,
    retentionRate12m: 79.0,
    totalTrainees: 580,
    verified: true,
    performanceScore: 91.5,
  },
  {
    id: "prov-3",
    name: "Vidarbha Vocational & Industrial Training Centre",
    district: "Nagpur",
    contactEmail: "nagpur.vocational@vidarbha-skills.in",
    placementRate: 72.0,
    verifiedPlacementRate: 64.0,
    retentionRate6m: 70.0,
    retentionRate12m: 62.0,
    totalTrainees: 310,
    verified: true,
    performanceScore: 76.8,
  },
  {
    id: "prov-4",
    name: "Nashik Engineering & Precision Training Hub",
    district: "Nashik",
    contactEmail: "admissions@nashik-precision.org",
    placementRate: 79.0,
    verifiedPlacementRate: 71.0,
    retentionRate6m: 76.5,
    retentionRate12m: 69.0,
    totalTrainees: 360,
    verified: true,
    performanceScore: 82.4,
  },
  {
    id: "prov-5",
    name: "Marathwada Skill Development Center",
    district: "Chhatrapati Sambhajinagar",
    contactEmail: "director@marathwadaskills.gov.in",
    placementRate: 68.5,
    verifiedPlacementRate: 59.0,
    retentionRate6m: 65.0,
    retentionRate12m: 57.0,
    totalTrainees: 290,
    verified: true,
    performanceScore: 71.2,
  },
  {
    id: "prov-6",
    name: "Thane Polytech & Allied Sciences",
    district: "Thane",
    contactEmail: "info@thanepoly.org",
    placementRate: 81.0,
    verifiedPlacementRate: 74.0,
    retentionRate6m: 78.0,
    retentionRate12m: 72.0,
    totalTrainees: 410,
    verified: true,
    performanceScore: 84.1,
  },
  {
    id: "prov-7",
    name: "Kolhapur Foundry & Heavy Engineering Institute",
    district: "Kolhapur",
    contactEmail: "trades@kolhapurfoundry.org",
    placementRate: 75.0,
    verifiedPlacementRate: 67.5,
    retentionRate6m: 74.0,
    retentionRate12m: 66.0,
    totalTrainees: 250,
    verified: true,
    performanceScore: 78.9,
  },
  {
    id: "prov-8",
    name: "Solapur Textile & Garment Training Center",
    district: "Solapur",
    contactEmail: "admin@solapurtextiles.in",
    placementRate: 64.0,
    verifiedPlacementRate: 53.0,
    retentionRate6m: 59.0,
    retentionRate12m: 51.0,
    totalTrainees: 230,
    verified: true,
    performanceScore: 65.7,
  },
  {
    id: "prov-9",
    name: "Amravati Rural & Agricultural Skilling Hub",
    district: "Amravati",
    contactEmail: "desk@amravatiskills.ac.in",
    placementRate: 61.0,
    verifiedPlacementRate: 50.5,
    retentionRate6m: 56.0,
    retentionRate12m: 48.0,
    totalTrainees: 190,
    verified: true,
    performanceScore: 63.4,
  },
  {
    id: "prov-10",
    name: "Navi Mumbai Logistics & Supply Chain Academy",
    district: "Navi Mumbai",
    contactEmail: "careers@navilogistics.edu.in",
    placementRate: 86.0,
    verifiedPlacementRate: 80.0,
    retentionRate6m: 82.0,
    retentionRate12m: 76.0,
    totalTrainees: 380,
    verified: true,
    performanceScore: 88.6,
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-1",
    providerId: "prov-1",
    providerName: "Maharashtra Advanced Skill Institute (MASI)",
    name: "CNC Operator & Programmer",
    sector: "Manufacturing",
    durationDays: 90,
    qpCode: "CSC/Q0115",
    description: "Precision computer numerical control machine operation, tooling, and basic G/M code verification.",
    placementRate: 82,
    demandScore: 91
  },
  {
    id: "course-2",
    providerId: "prov-1",
    providerName: "Maharashtra Advanced Skill Institute (MASI)",
    name: "Automotive Maintenance Technician",
    sector: "Automotive",
    durationDays: 120,
    qpCode: "ASC/Q1402",
    description: "Diagnostic, maintenance, and repair protocols for light commercial vehicles and modern ICE engines.",
    placementRate: 85,
    demandScore: 88
  },
  {
    id: "course-3",
    providerId: "prov-2",
    providerName: "Mumbai Technical & Digital Academy",
    name: "Full Stack Web Developer (Node/React)",
    sector: "IT/ITeS",
    durationDays: 180,
    qpCode: "SSC/Q0508",
    description: "Modern web architecture, responsive interfaces, cloud deployments, and RESTful service integration.",
    placementRate: 91,
    demandScore: 94
  },
  {
    id: "course-4",
    providerId: "prov-2",
    providerName: "Mumbai Technical & Digital Academy",
    name: "Data Operations & Analytics Associate",
    sector: "IT/ITeS",
    durationDays: 90,
    qpCode: "SSC/Q2212",
    description: "Data extraction, pipeline cleaning, spreadsheet automation, and dashboard reporting.",
    placementRate: 84,
    demandScore: 86
  },
  {
    id: "course-5",
    providerId: "prov-6",
    providerName: "Thane Polytech & Allied Sciences",
    name: "General Duty Assistant (Healthcare)",
    sector: "Healthcare",
    durationDays: 90,
    qpCode: "HSS/Q5101",
    description: "Patient mobilization, vital monitoring, clinical infection control, and geriatric nursing assistance.",
    placementRate: 89,
    demandScore: 93
  },
  {
    id: "course-6",
    providerId: "prov-4",
    providerName: "Nashik Engineering & Precision Training Hub",
    name: "Solar PV Project Installation Technician",
    sector: "Renewable Energy",
    durationDays: 60,
    qpCode: "SGJ/Q0101",
    description: "Rooftop and ground-mount PV panel stringing, inverter integration, and grid synchronization testing.",
    placementRate: 77,
    demandScore: 82
  },
  {
    id: "course-7",
    providerId: "prov-10",
    providerName: "Navi Mumbai Logistics & Supply Chain Academy",
    name: "Warehouse & Inventory Supervisor",
    sector: "Logistics",
    durationDays: 75,
    qpCode: "LSC/Q0104",
    description: "Automated warehouse management systems, barcode tracing, dock scheduling, and dispatch protocols.",
    placementRate: 86,
    demandScore: 89
  },
  {
    id: "course-8",
    providerId: "prov-8",
    providerName: "Solapur Textile & Garment Training Center",
    name: "Industrial Sewing Machine Operator",
    sector: "Textiles",
    durationDays: 60,
    qpCode: "AMH/Q0301",
    description: "High-speed single/double needle garment assembly, quality seam verification, and defect reduction.",
    placementRate: 62,
    demandScore: 68
  },
  {
    id: "course-9",
    providerId: "prov-7",
    providerName: "Kolhapur Foundry & Heavy Engineering Institute",
    name: "Foundry Pattern Maker & Casting Specialist",
    sector: "Manufacturing",
    durationDays: 120,
    qpCode: "CSC/Q0204",
    description: "Pattern crafting, mold core preparation, molten iron pouring safety, and sand reclamation.",
    placementRate: 76,
    demandScore: 80
  },
  {
    id: "course-10",
    providerId: "prov-3",
    providerName: "Vidarbha Vocational & Industrial Training Centre",
    name: "Electric Vehicle Assembly Technician",
    sector: "Automotive",
    durationDays: 90,
    qpCode: "ASC/Q1435",
    description: "High voltage battery pack assembly, BMS wiring harness installation, and dyno safety checks.",
    placementRate: 80,
    demandScore: 95
  },
  {
    id: "course-11",
    providerId: "prov-5",
    providerName: "Marathwada Skill Development Center",
    name: "Retail Store Sales Associate",
    sector: "Retail",
    durationDays: 45,
    qpCode: "RAS/Q0104",
    description: "Customer service, merchandising standards, POS billing transactions, and inventory stock counting.",
    placementRate: 70,
    demandScore: 73
  },
  {
    id: "course-12",
    providerId: "prov-9",
    providerName: "Amravati Rural & Agricultural Skilling Hub",
    name: "Micro-Irrigation & Agri-Equipment Technician",
    sector: "Agriculture",
    durationDays: 60,
    qpCode: "AGR/Q1102",
    description: "Drip line layout, filtration maintenance, solar submersible pump servicing, and fertigation setup.",
    placementRate: 63,
    demandScore: 71
  },
  {
    id: "course-13",
    providerId: "prov-2",
    providerName: "Mumbai Technical & Digital Academy",
    name: "Hospitality Front Desk Executive",
    sector: "Hospitality",
    durationDays: 60,
    qpCode: "THC/Q0102",
    description: "PMS system management, guest relations, concierge reservation handling, and guest billing.",
    placementRate: 78,
    demandScore: 81
  },
  {
    id: "course-14",
    providerId: "prov-6",
    providerName: "Thane Polytech & Allied Sciences",
    name: "Phlebotomy & Diagnostic Lab Technician",
    sector: "Healthcare",
    durationDays: 90,
    qpCode: "HSS/Q0301",
    description: "Venipuncture, sample barcoding, centrifuge operation, and pathology LIMS data handling.",
    placementRate: 87,
    demandScore: 92
  },
  {
    id: "course-15",
    providerId: "prov-4",
    providerName: "Nashik Engineering & Precision Training Hub",
    name: "Drone Assembly & Maintenance Technician",
    sector: "Electronics",
    durationDays: 75,
    qpCode: "ELE/Q7102",
    description: "Quadcopter flight controller flashing, ESC calibration, brushless motor testing, and payload rigging.",
    placementRate: 83,
    demandScore: 96
  }
];

export const INITIAL_EMPLOYERS: Employer[] = [
  {
    id: "emp-1",
    name: "XYZ Precision Manufacturing Ltd",
    pfRegistrationNo: "MH/PUN/0048192/000",
    district: "Pune",
    sector: "Manufacturing",
    verified: true,
    activeTraineesCount: 42
  },
  {
    id: "emp-2",
    name: "Bharat Forge Engineering Works",
    pfRegistrationNo: "MH/PUN/0012903/000",
    district: "Pune",
    sector: "Manufacturing",
    verified: true,
    activeTraineesCount: 88
  },
  {
    id: "emp-3",
    name: "Tata Motors Commercial Vehicle Hub",
    pfRegistrationNo: "MH/PUN/0004928/000",
    district: "Pune",
    sector: "Automotive",
    verified: true,
    activeTraineesCount: 115
  },
  {
    id: "emp-4",
    name: "Persistent Digital Systems",
    pfRegistrationNo: "MH/PUN/0091823/000",
    district: "Pune",
    sector: "IT/ITeS",
    verified: true,
    activeTraineesCount: 65
  },
  {
    id: "emp-5",
    name: "Apollo Multispeciality Hospitals",
    pfRegistrationNo: "MH/BOM/0038194/000",
    district: "Mumbai",
    sector: "Healthcare",
    verified: true,
    activeTraineesCount: 54
  },
  {
    id: "emp-6",
    name: "Reliance Retail Logistics Center",
    pfRegistrationNo: "MH/THN/0071829/000",
    district: "Thane",
    sector: "Logistics",
    verified: true,
    activeTraineesCount: 78
  },
  {
    id: "emp-7",
    name: "Mahindra & Mahindra Farm Equipment",
    pfRegistrationNo: "MH/NSK/0056192/000",
    district: "Nashik",
    sector: "Automotive",
    verified: true,
    activeTraineesCount: 62
  },
  {
    id: "emp-8",
    name: "Infosys BPM Technologies",
    pfRegistrationNo: "MH/PUN/0082716/000",
    district: "Pune",
    sector: "IT/ITeS",
    verified: true,
    activeTraineesCount: 94
  },
  {
    id: "emp-9",
    name: "Bajaj Auto Aurangabad Plant",
    pfRegistrationNo: "MH/AUR/0041928/000",
    district: "Chhatrapati Sambhajinagar",
    sector: "Automotive",
    verified: true,
    activeTraineesCount: 71
  },
  {
    id: "emp-10",
    name: "Godrej & Boyce Manufacturing",
    pfRegistrationNo: "MH/BOM/0019283/000",
    district: "Mumbai",
    sector: "Manufacturing",
    verified: true,
    activeTraineesCount: 58
  },
  {
    id: "emp-11",
    name: "Kirloskar Brothers Industrial Valves",
    pfRegistrationNo: "MH/KOL/0028194/000",
    district: "Kolhapur",
    sector: "Manufacturing",
    verified: true,
    activeTraineesCount: 39
  },
  {
    id: "emp-12",
    name: "Serum Institute Biotech Facilities",
    pfRegistrationNo: "MH/PUN/0099281/000",
    district: "Pune",
    sector: "Healthcare",
    verified: true,
    activeTraineesCount: 46
  },
  {
    id: "emp-13",
    name: "Jawaharlal Nehru Port Trust Terminal (JNPT)",
    pfRegistrationNo: "MH/NVM/0082194/000",
    district: "Navi Mumbai",
    sector: "Logistics",
    verified: true,
    activeTraineesCount: 68
  },
  {
    id: "emp-14",
    name: "Raymond Textiles Finishing Unit",
    pfRegistrationNo: "MH/THN/0012847/000",
    district: "Thane",
    sector: "Textiles",
    verified: true,
    activeTraineesCount: 31
  },
  {
    id: "emp-15",
    name: "SolarEdge Green Energy Solutions",
    pfRegistrationNo: "MH/NSK/0073821/000",
    district: "Nashik",
    sector: "Renewable Energy",
    verified: true,
    activeTraineesCount: 29
  },
  {
    id: "emp-16",
    name: "Nagpur Metro Rail Engineering O&M",
    pfRegistrationNo: "MH/NGP/0048291/000",
    district: "Nagpur",
    sector: "Logistics",
    verified: true,
    activeTraineesCount: 36
  },
  {
    id: "emp-17",
    name: "Solapur Chadder & Terry Towel Cluster",
    pfRegistrationNo: "MH/SOL/0028491/000",
    district: "Solapur",
    sector: "Textiles",
    verified: true,
    activeTraineesCount: 24
  },
  {
    id: "emp-18",
    name: "Taj Gateway Hospitality Group",
    pfRegistrationNo: "MH/BOM/0061928/000",
    district: "Mumbai",
    sector: "Hospitality",
    verified: true,
    activeTraineesCount: 45
  },
  {
    id: "emp-19",
    name: "Metropolis Healthcare Diagnostic Labs",
    pfRegistrationNo: "MH/BOM/0051928/000",
    district: "Mumbai",
    sector: "Healthcare",
    verified: true,
    activeTraineesCount: 52
  },
  {
    id: "emp-20",
    name: "Garuda Aerospace Agricultural Drone Hub",
    pfRegistrationNo: "MH/NGP/0091827/000",
    district: "Nagpur",
    sector: "Electronics",
    verified: true,
    activeTraineesCount: 28
  }
];
// 100+ Seed Trainees
const DISTRICTS = ["Pune", "Mumbai", "Nagpur", "Nashik", "Thane", "Kolhapur", "Solapur", "Amravati", "Chhatrapati Sambhajinagar", "Navi Mumbai"];
const GENDERS: ("Male" | "Female" | "Other")[] = ["Male", "Female", "Male", "Female", "Male", "Female"];
const CASTES: ("General" | "OBC" | "SC" | "ST" | "EWS")[] = ["General", "OBC", "SC", "ST", "EWS", "OBC", "General"];

const FIRST_NAMES = [
  "Rahul", "Priya", "Amit", "Sneha", "Vikas", "Pooja", "Sachin", "Anjali", "Rohan", "Deepika",
  "Nilesh", "Kavita", "Gaurav", "Pallavi", "Swapnil", "Neeta", "Kishore", "Archana", "Aditya", "Meera",
  "Siddharth", "Aarti", "Manoj", "Shilpa", "Prashant", "Sunita", "Chetan", "Rupali", "Tushar", "Madhuri",
  "Sanjay", "Jyoti", "Rajesh", "Varsha", "Mahesh", "Anita", "Akash", "Swati", "Sandeep", "Komal",
  "Nitin", "Manisha", "Ajay", "Shweta", "Santosh", "Divya", "Vinod", "Tanvi", "Sunil", "Priyanka"
];

const LAST_NAMES = [
  "Kumar", "Sharma", "Patil", "Deshmukh", "Jadhav", "Kulkarni", "Pawar", "Shinde", "Chavan", "More",
  "Wagh", "Bhosale", "Gaikwad", "Tambe", "Gawande", "Thakur", "Sawant", "Salunkhe", "Kamble", "Mane",
  "Gharat", "Gore", "Suryavanshi", "Kadam", "Lokhande", "Dhole", "Khare", "Ingle", "Rathod", "Solanki"
];

export const INITIAL_TRAINEES: Trainee[] = [
  // Our Demo Protagonist
  {
    id: "trainee-1",
    skillId: "SKILL-MH-2026-0001",
    pseudonymousId: "DL-8472-X4",
    name: "Rahul Kumar",
    phoneMasked: "+91 98****4120",
    district: "Pune",
    gender: "Male",
    casteCategory: "OBC",
    consentGiven: true,
    consentAt: "2026-01-15T09:30:00Z",
    createdAt: "2026-01-15T09:30:00Z",
    currentStatus: "EMPLOYED",
    currentRole: "CNC Machine Operator",
    currentEmployer: "XYZ Precision Manufacturing Ltd"
  }
];

// Generate 104 additional realistic trainees across Maharashtra
for (let i = 2; i <= 105; i++) {
  const fName = FIRST_NAMES[(i * 3 + 7) % FIRST_NAMES.length];
  const lName = LAST_NAMES[(i * 5 + 11) % LAST_NAMES.length];
  const district = DISTRICTS[i % DISTRICTS.length];
  const gender = GENDERS[i % GENDERS.length];
  const caste = CASTES[i % CASTES.length];
  
  let status: OutcomeType = "EMPLOYED";
  if (i % 7 === 0) status = "SEARCHING";
  else if (i % 9 === 0) status = "SELF_EMPLOYED";
  else if (i % 11 === 0) status = "APPRENTICESHIP";
  else if (i % 13 === 0) status = "UNEMPLOYED";

  INITIAL_TRAINEES.push({
    id: `trainee-${i}`,
    skillId: `SKILL-MH-2026-${String(i).padStart(4, "0")}`,
    pseudonymousId: `DL-${String(7000 + i * 17).slice(0, 4)}-${String.fromCharCode(65 + (i % 26))}${i % 9}`,
    name: `${fName} ${lName}`,
    phoneMasked: `+91 9${(i % 5) + 4}****${String(1000 + i * 23).slice(-4)}`,
    district,
    gender,
    casteCategory: caste,
    consentGiven: true,
    consentAt: "2026-02-10T10:00:00Z",
    createdAt: "2026-02-10T10:00:00Z",
    currentStatus: status,
    currentRole: status === "EMPLOYED" ? "Junior Technician" : undefined,
    currentEmployer: status === "EMPLOYED" ? "Industrial Partner" : undefined
  });
}

// Training Records
export const INITIAL_TRAINING_RECORDS: TrainingRecord[] = [
  // Rahul Kumar's initial training record (ready for demonstration verification)
  {
    id: "tr-1",
    traineeId: "trainee-1",
    courseId: "course-1",
    courseName: "CNC Operator & Programmer",
    providerId: "prov-1",
    providerName: "Maharashtra Advanced Skill Institute (MASI)",
    enrollmentDate: "2026-03-01",
    completionDate: "2026-06-01",
    attendancePct: 92.5,
    assessmentScore: 84.0,
    certificateId: "CERT-CNC-2026-0842",
    certificationDate: "2026-06-05",
    verificationStatus: "PENDING", // Trainee submitted; waiting for institution verification
  }
];

for (let i = 2; i <= 105; i++) {
  const course = INITIAL_COURSES[(i - 2) % INITIAL_COURSES.length];
  // realistic variation: 80% verified, 12% pending, 8% rejected/needs review
  let status: VerificationStatus = "VERIFIED";
  if (i % 8 === 0) status = "PENDING";
  else if (i % 19 === 0) status = "REJECTED";
  else if (i % 23 === 0) status = "NEEDS_REVIEW";

  INITIAL_TRAINING_RECORDS.push({
    id: `tr-${i}`,
    traineeId: `trainee-${i}`,
    courseId: course.id,
    courseName: course.name,
    providerId: course.providerId,
    providerName: course.providerName || "Skill Provider",
    enrollmentDate: "2026-01-10",
    completionDate: "2026-04-15",
    attendancePct: 80 + (i % 18),
    assessmentScore: 68 + (i % 28),
    certificateId: `CERT-${course.qpCode.replace("/", "-")}-${1000 + i}`,
    certificationDate: "2026-04-20",
    verificationStatus: status,
    verifiedAt: status === "VERIFIED" ? "2026-04-22T14:30:00Z" : undefined,
    verifiedBy: status === "VERIFIED" ? "Director of Assessments" : undefined
  });
}

// Employment Outcomes
export const INITIAL_EMPLOYMENT_OUTCOMES: EmploymentOutcome[] = [
  // Rahul Kumar's initial employment claim
  {
    id: "emp-out-1",
    traineeId: "trainee-1",
    traineeName: "Rahul Kumar",
    employerId: "emp-1",
    employerName: "XYZ Precision Manufacturing Ltd",
    outcomeType: "EMPLOYED",
    jobRole: "CNC Machine Operator",
    salaryBand: "₹18,000 - ₹22,000 / month",
    sector: "Manufacturing",
    startDate: "2026-08-15",
    retained6m: false, // 6m follow-up pending
    retained12m: false,
    verificationStatus: "PENDING", // Trainee claimed; waiting for employer verification
    institutionVerified: false,
    employerVerified: false,
    epfoSignalVerified: true, // External EPFO signal match found
    nonPlacementReason: undefined
  }
];

const NON_PLACEMENT_REASONS = [
  "Skill mismatch - companies require advanced CAD/CAM software",
  "Local industrial units offered below minimum wage expectation",
  "Lack of opportunities within 25 km commute distance",
  "Company required prior 1-year experience not covered in course",
  "Family relocation to hometown due to agricultural harvest season",
  "Pursuing higher technical polytechnic diploma"
];

for (let i = 2; i <= 105; i++) {
  const trainee = INITIAL_TRAINEES[i - 1];
  const employer = INITIAL_EMPLOYERS[(i - 2) % INITIAL_EMPLOYERS.length];
  const course = INITIAL_COURSES[(i - 2) % INITIAL_COURSES.length];
  
  if (trainee.currentStatus === "EMPLOYED" || trainee.currentStatus === "APPRENTICESHIP") {
    // 75% verified, 15% pending, 10% disputed/rejected
    let status: VerificationStatus = "VERIFIED";
    if (i % 6 === 0) status = "PENDING";
    else if (i % 17 === 0) status = "DISPUTED";
    else if (i % 29 === 0) status = "REJECTED";

    INITIAL_EMPLOYMENT_OUTCOMES.push({
      id: `emp-out-${i}`,
      traineeId: trainee.id,
      traineeName: trainee.name,
      employerId: employer.id,
      employerName: employer.name,
      outcomeType: trainee.currentStatus,
      jobRole: `${course.name.split(" ")[0]} Specialist`,
      salaryBand: `₹${16 + (i % 14)},000 - ₹${20 + (i % 14)},000 / month`,
      sector: course.sector,
      startDate: "2026-05-01",
      retained6m: i % 4 !== 0, // 75% 6-month retention
      retained12m: i % 3 === 0, // realistic longitudinal drop-off
      verificationStatus: status,
      institutionVerified: true,
      employerVerified: status === "VERIFIED",
      epfoSignalVerified: i % 5 !== 0,
      verifiedAt: status === "VERIFIED" ? "2026-05-10T11:00:00Z" : undefined
    });
  } else {
    // Non-placement or Self-employed
    INITIAL_EMPLOYMENT_OUTCOMES.push({
      id: `emp-out-${i}`,
      traineeId: trainee.id,
      traineeName: trainee.name,
      outcomeType: trainee.currentStatus,
      sector: course.sector,
      retained6m: false,
      retained12m: false,
      verificationStatus: trainee.currentStatus === "SELF_EMPLOYED" ? "VERIFIED" : "NEEDS_REVIEW",
      institutionVerified: true,
      employerVerified: false,
      epfoSignalVerified: false,
      nonPlacementReason: trainee.currentStatus === "SEARCHING" || trainee.currentStatus === "UNEMPLOYED" 
        ? NON_PLACEMENT_REASONS[i % NON_PLACEMENT_REASONS.length]
        : undefined,
      nlpTags: trainee.currentStatus === "SEARCHING" ? ["CAD", "Skill Mismatch", "Commute Distance"] : undefined
    });
  }
}

// Verification Requests
export const INITIAL_VERIFICATION_REQUESTS: VerificationRequest[] = [
  // Rahul Kumar's pending requests for live demonstration
  {
    id: "vr-1",
    claimType: "TRAINING_VERIFICATION",
    traineeId: "trainee-1",
    traineeName: "Rahul Kumar",
    targetId: "prov-1",
    targetName: "Maharashtra Advanced Skill Institute (MASI)",
    courseName: "CNC Operator & Programmer",
    submittedAt: "2026-06-05T10:00:00Z",
    status: "PENDING",
    notes: "Trainee completed 90-day curriculum with 92.5% attendance and 84% assessment.",
    updatedAt: "2026-06-05T10:00:00Z",
    certificateId: "CERT-CNC-2026-0842",
    assessmentScore: 84.0
  },
  {
    id: "vr-2",
    claimType: "EMPLOYMENT_VERIFICATION",
    traineeId: "trainee-1",
    traineeName: "Rahul Kumar",
    targetId: "emp-1",
    targetName: "XYZ Precision Manufacturing Ltd",
    jobRole: "CNC Machine Operator",
    submittedAt: "2026-08-16T09:15:00Z",
    status: "PENDING",
    notes: "Candidate claims employment as CNC Machine Operator starting August 15, 2026.",
    updatedAt: "2026-08-16T09:15:00Z",
    startDate: "2026-08-15"
  },
  // Additional active queue items for institution & employer
  {
    id: "vr-3",
    claimType: "TRAINING_VERIFICATION",
    traineeId: "trainee-8",
    traineeName: "Sneha Jadhav",
    targetId: "prov-1",
    targetName: "Maharashtra Advanced Skill Institute (MASI)",
    courseName: "Automotive Maintenance Technician",
    submittedAt: "2026-08-20T11:45:00Z",
    status: "PENDING",
    certificateId: "CERT-ASC-1008",
    assessmentScore: 79.0,
    updatedAt: "2026-08-20T11:45:00Z"
  },
  {
    id: "vr-4",
    claimType: "EMPLOYMENT_VERIFICATION",
    traineeId: "trainee-12",
    traineeName: "Deepika Deshmukh",
    targetId: "emp-1",
    targetName: "XYZ Precision Manufacturing Ltd",
    jobRole: "CNC Machine Operator",
    submittedAt: "2026-08-22T14:10:00Z",
    status: "PENDING",
    startDate: "2026-08-20",
    updatedAt: "2026-08-22T14:10:00Z"
  }
];

// Followup Touchpoints
export const INITIAL_FOLLOWUPS: FollowupTouchpoint[] = [
  // Rahul Kumar's checkpoints
  {
    id: "fp-1",
    traineeId: "trainee-1",
    checkpointDays: 30,
    channel: "WHATSAPP",
    status: "RESPONDED",
    responseData: {
      employmentStatus: "EMPLOYED",
      jobRole: "CNC Machine Operator",
      employerName: "XYZ Precision Manufacturing Ltd",
      salaryBand: "₹18,000 - ₹22,000 / month",
      feedback: "Work atmosphere is good; using CNC milling and lathe daily."
    },
    sentAt: "2026-09-15T10:00:00Z",
    respondedAt: "2026-09-15T16:20:00Z"
  },
  {
    id: "fp-2",
    traineeId: "trainee-1",
    checkpointDays: 90,
    channel: "PORTAL",
    status: "PENDING", // Ready to be triggered in demo!
    sentAt: "2026-11-15T09:00:00Z"
  },
  {
    id: "fp-3",
    traineeId: "trainee-1",
    checkpointDays: 180,
    channel: "SMS",
    status: "PENDING"
  },
  {
    id: "fp-4",
    traineeId: "trainee-1",
    checkpointDays: 365,
    channel: "WHATSAPP",
    status: "PENDING"
  }
];

// Skill Gap Signals across Maharashtra Districts
export const INITIAL_SKILL_GAP_SIGNALS: SkillGapSignal[] = [
  {
    id: "sgs-1",
    district: "Pune",
    courseName: "CNC Operator & Programmer",
    sector: "Manufacturing",
    placementRate: 58.2,
    avgDaysToPlacement: 47,
    employerDemandScore: 86.4,
    topMissingSkills: ["AutoCAD / CAD Fundamentals", "CAM Toolpath Generation", "Geometric Dimensioning & Tolerancing (GD&T)"],
    nonPlacementReasons: [
      { reason: "Skill mismatch - CAD software proficiency demanded by auto-ancillaries", percentage: 48 },
      { reason: "Wages offered below ₹15,000 / month", percentage: 24 },
      { reason: "Commute distance over 35 km from industrial MIDC zones", percentage: 18 },
      { reason: "Other personal/relocation reasons", percentage: 10 }
    ],
    computedAt: "2026-09-01T00:00:00Z"
  },
  {
    id: "sgs-2",
    district: "Mumbai",
    courseName: "Full Stack Web Developer",
    sector: "IT/ITeS",
    placementRate: 74.0,
    avgDaysToPlacement: 32,
    employerDemandScore: 94.0,
    topMissingSkills: ["Next.js App Router", "Docker & Microservices", "PostgreSQL Performance Optimization"],
    nonPlacementReasons: [
      { reason: "Employers require live production portfolio projects", percentage: 42 },
      { reason: "High bar on algorithm & data structures interviews", percentage: 31 },
      { reason: "Shift timing constraints", percentage: 16 },
      { reason: "Other", percentage: 11 }
    ],
    computedAt: "2026-09-01T00:00:00Z"
  },
  {
    id: "sgs-3",
    district: "Nagpur",
    courseName: "Electric Vehicle Assembly Technician",
    sector: "Automotive",
    placementRate: 64.5,
    avgDaysToPlacement: 52,
    employerDemandScore: 92.0,
    topMissingSkills: ["CAN Bus Diagnostics", "High Voltage Battery Safety Interlocks", "BMS Harness Calibration"],
    nonPlacementReasons: [
      { reason: "Need certified high-voltage safety qualification", percentage: 54 },
      { reason: "Lack of local EV OEM assembly plants outside MIHAN", percentage: 28 },
      { reason: "Wage disparity compared to Pune/Mumbai", percentage: 18 }
    ],
    computedAt: "2026-09-01T00:00:00Z"
  },
  {
    id: "sgs-4",
    district: "Nashik",
    courseName: "Solar PV Installation Technician",
    sector: "Renewable Energy",
    placementRate: 69.0,
    avgDaysToPlacement: 39,
    employerDemandScore: 81.5,
    topMissingSkills: ["High-Tension Inverter Synchronization", "Net Metering Regulations (MSEDCL)", "Lightning Arrestor Earthing"],
    nonPlacementReasons: [
      { reason: "Seasonal fluctuations in commercial rooftop installations", percentage: 46 },
      { reason: "Contractual gig jobs rather than permanent payroll", percentage: 34 },
      { reason: "Two-wheeler mobility requirement not met", percentage: 20 }
    ],
    computedAt: "2026-09-01T00:00:00Z"
  },
  {
    id: "sgs-5",
    district: "Chhatrapati Sambhajinagar",
    courseName: "Automotive Maintenance Technician",
    sector: "Automotive",
    placementRate: 61.0,
    avgDaysToPlacement: 55,
    employerDemandScore: 78.0,
    topMissingSkills: ["OBD-II Electronic Diagnostic Scanners", "Automatic Transmission Hydraulics", "Common Rail Diesel Injection"],
    nonPlacementReasons: [
      { reason: "Workshops demand hands-on scanner experience", percentage: 52 },
      { reason: "Apprenticeship stipend below expectations", percentage: 30 },
      { reason: "Relocation to Waluj / Shendra MIDC required", percentage: 18 }
    ],
    computedAt: "2026-09-01T00:00:00Z"
  },
  {
    id: "sgs-6",
    district: "Thane",
    courseName: "General Duty Assistant (Healthcare)",
    sector: "Healthcare",
    placementRate: 83.5,
    avgDaysToPlacement: 24,
    employerDemandScore: 91.0,
    topMissingSkills: ["Electronic Medical Record (EMR) Entry", "ICU Patient Hygiene Protocols", "Biomedical Waste Handling"],
    nonPlacementReasons: [
      { reason: "Night-shift rotation unwillingness", percentage: 58 },
      { reason: "Commute to South Mumbai tertiary care hospitals", percentage: 26 },
      { reason: "Family health emergencies", percentage: 16 }
    ],
    computedAt: "2026-09-01T00:00:00Z"
  },
  {
    id: "sgs-7",
    district: "Solapur",
    courseName: "Industrial Sewing Machine Operator",
    sector: "Textiles",
    placementRate: 51.0,
    avgDaysToPlacement: 68,
    employerDemandScore: 66.0,
    topMissingSkills: ["Electronic Jacquard Loom Mechanics", "Pneumatic Terry Towel Hemming", "Pattern Speed Stitching"],
    nonPlacementReasons: [
      { reason: "Powerloom cluster moving to automated Chinese rapier looms", percentage: 60 },
      { reason: "Piece-rate wages insufficient", percentage: 25 },
      { reason: "Migrating to Pune for packaging jobs", percentage: 15 }
    ],
    computedAt: "2026-09-01T00:00:00Z"
  },
  {
    id: "sgs-8",
    district: "Kolhapur",
    courseName: "Foundry Pattern Maker",
    sector: "Manufacturing",
    placementRate: 70.2,
    avgDaysToPlacement: 44,
    employerDemandScore: 79.5,
    topMissingSkills: ["3D Resin Printing for Casting Molds", "Spectrometer Metallurgy Analysis", "Foundry EHS Regulations"],
    nonPlacementReasons: [
      { reason: "Physical foundry working environment concerns", percentage: 45 },
      { reason: "Shift allowance not provided", percentage: 32 },
      { reason: "Small job shops lacking formal PF enrollment", percentage: 23 }
    ],
    computedAt: "2026-09-01T00:00:00Z"
  }
];

// Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    actorId: "system-1",
    actorName: "DigiLocker Verification Gateway",
    actorRole: "SYSTEM",
    action: "IDENTITY_VERIFIED",
    tableName: "trainees",
    recordId: "trainee-1",
    metadata: { pseudonymousId: "DL-8472-X4", consentRecorded: true, ip: "103.21.124.8" },
    createdAt: "2026-01-15T09:30:12Z"
  },
  {
    id: "log-2",
    actorId: "trainee-1",
    actorName: "Rahul Kumar",
    actorRole: "TRAINEE",
    action: "TRAINING_CLAIM_SUBMITTED",
    tableName: "training_records",
    recordId: "tr-1",
    metadata: { course: "CNC Operator & Programmer", provider: "MASI", certificateId: "CERT-CNC-2026-0842" },
    createdAt: "2026-06-05T10:00:00Z"
  },
  {
    id: "log-3",
    actorId: "system-1",
    actorName: "Verification Engine",
    actorRole: "SYSTEM",
    action: "VERIFICATION_REQUEST_DISPATCHED",
    tableName: "verification_requests",
    recordId: "vr-1",
    metadata: { target: "Maharashtra Advanced Skill Institute (MASI)", type: "TRAINING_VERIFICATION" },
    createdAt: "2026-06-05T10:00:05Z"
  },
  {
    id: "log-4",
    actorId: "trainee-1",
    actorName: "Rahul Kumar",
    actorRole: "TRAINEE",
    action: "EMPLOYMENT_CLAIM_SUBMITTED",
    tableName: "employment_outcomes",
    recordId: "emp-out-1",
    metadata: { employer: "XYZ Precision Manufacturing Ltd", role: "CNC Machine Operator", startDate: "2026-08-15" },
    createdAt: "2026-08-16T09:15:00Z"
  },
  {
    id: "log-5",
    actorId: "system-1",
    actorName: "EPFO Signal Adapter",
    actorRole: "SYSTEM",
    action: "EXTERNAL_SIGNAL_MATCHED",
    tableName: "employment_outcomes",
    recordId: "emp-out-1",
    metadata: { pfCode: "MH/PUN/0048192/000", matchConfidence: 0.98, status: "Active Contributor" },
    createdAt: "2026-08-16T09:15:10Z"
  }
];
