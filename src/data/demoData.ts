/**
 * LifeRescue AI — DEMO DATA
 * ------------------------------------------------------------------
 * All names, phone numbers, locations and medical values below are
 * FICTIONAL and created only for an educational college demonstration.
 * Locations are centred around Hyderabad, Telangana (India).
 * Coordinates use a normalised 0–100 grid so the simulated map (SVG)
 * can render routes without requiring a paid maps API key.
 */

import type {
  Ambulance,
  AmbulanceType,
  AppNotification,
  CompletedTrip,
  Driver,
  EmergencyContact,
  EmergencyRequest,
  EmergencyType,
  Hospital,
  Patient,
  Priority,
  User,
} from '../types';

let idCounter = 1000;
export const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();
const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

/* --------------------------- Hospitals (8) --------------------------- */

export const hospitals: Hospital[] = [
  { id: 'HSP-01', name: 'City Emergency Hospital', address: 'Plot 14, Ameerpet Main Road, Hyderabad, Telangana 500016', location: 'Ameerpet', phone: '+91 40 2345 6701', distanceKm: 3.4, emergencyDept: true, icuAvailable: true, icuBeds: 6, icuBedsTotal: 24, departments: ['Emergency', 'ICU', 'Cardiology', 'Neurology', 'Trauma', 'General Medicine'], specializations: ['Trauma Care', 'Cardiac Emergency', 'Stroke Unit'], rating: 4.6, open24x7: true, ambulancesAvailable: 5, incomingPatients: 3, latitude: 17.4375, longitude: 78.4483 },
  { id: 'HSP-02', name: 'Sunshine Multispeciality Hospital', address: 'Road No. 2, Banjara Hills, Hyderabad, Telangana 500034', location: 'Banjara Hills', phone: '+91 40 2345 6702', distanceKm: 5.8, emergencyDept: true, icuAvailable: true, icuBeds: 11, icuBedsTotal: 32, departments: ['Emergency', 'ICU', 'Cardiology', 'Orthopaedics', 'Obstetrics', 'General Medicine'], specializations: ['Cardiac Sciences', 'Maternal Care', 'Orthopaedics'], rating: 4.7, open24x7: true, ambulancesAvailable: 4, incomingPatients: 5, latitude: 17.4126, longitude: 78.4392 },
  { id: 'HSP-03', name: 'Gandhi General Hospital', address: 'Musheerabad, Hyderabad, Telangana 500020', location: 'Musheerabad', phone: '+91 40 2345 6703', distanceKm: 7.2, emergencyDept: true, icuAvailable: true, icuBeds: 4, icuBedsTotal: 20, departments: ['Emergency', 'ICU', 'Trauma', 'Burns', 'General Medicine'], specializations: ['Burns Unit', 'Trauma Care'], rating: 4.2, open24x7: true, ambulancesAvailable: 7, incomingPatients: 8, latitude: 17.4128, longitude: 78.4983 },
  { id: 'HSP-04', name: 'Apex Heart & Critical Care Institute', address: 'Jubilee Hills Check Post, Hyderabad, Telangana 500033', location: 'Jubilee Hills', phone: '+91 40 2345 6704', distanceKm: 9.1, emergencyDept: true, icuAvailable: true, icuBeds: 9, icuBedsTotal: 18, departments: ['Emergency', 'ICU', 'Cardiology', 'Neurology'], specializations: ['Interventional Cardiology', 'Heart Failure Clinic'], rating: 4.8, open24x7: true, ambulancesAvailable: 2, incomingPatients: 4, latitude: 17.4239, longitude: 78.4128 },
  { id: 'HSP-05', name: 'Rainbow Children & Neonatal Hospital', address: 'Kondapur Main Road, Hyderabad, Telangana 500084', location: 'Kondapur', phone: '+91 40 2345 6705', distanceKm: 11.4, emergencyDept: true, icuAvailable: true, icuBeds: 7, icuBedsTotal: 16, departments: ['Emergency', 'ICU', 'Pediatrics', 'Obstetrics'], specializations: ['Neonatal ICU', 'Pediatric Emergency'], rating: 4.7, open24x7: true, ambulancesAvailable: 3, incomingPatients: 2, latitude: 17.4641, longitude: 78.3614 },
  { id: 'HSP-06', name: 'Osmania Trauma & Accident Care', address: 'Afzalgunj, Hyderabad, Telangana 500012', location: 'Afzalgunj', phone: '+91 40 2345 6706', distanceKm: 6.5, emergencyDept: true, icuAvailable: false, icuBeds: 0, icuBedsTotal: 14, departments: ['Emergency', 'Trauma', 'Orthopaedics', 'General Medicine'], specializations: ['Road Accident Trauma', 'Fracture Care'], rating: 4.1, open24x7: true, ambulancesAvailable: 6, incomingPatients: 11, latitude: 17.3757, longitude: 78.4708 },
  { id: 'HSP-07', name: 'KIMS Multi-Speciality Hospital', address: 'Minister Road, Secunderabad, Telangana 500003', location: 'Secunderabad', phone: '+91 40 2345 6707', distanceKm: 8.8, emergencyDept: true, icuAvailable: true, icuBeds: 13, icuBedsTotal: 28, departments: ['Emergency', 'ICU', 'Cardiology', 'Neurology', 'Trauma', 'General Medicine'], specializations: ['Neuro Critical Care', 'Polytrauma'], rating: 4.5, open24x7: true, ambulancesAvailable: 4, incomingPatients: 6, latitude: 17.4399, longitude: 78.4983 },
  { id: 'HSP-08', name: 'CareWell Women & Maternity Hospital', address: 'Dilsukhnagar, Hyderabad, Telangana 500060', location: 'Dilsukhnagar', phone: '+91 40 2345 6708', distanceKm: 10.2, emergencyDept: true, icuAvailable: true, icuBeds: 5, icuBedsTotal: 12, departments: ['Emergency', 'ICU', 'Obstetrics', 'Pediatrics'], specializations: ['High-Risk Pregnancy', 'Newborn Care'], rating: 4.4, open24x7: false, ambulancesAvailable: 2, incomingPatients: 1, latitude: 17.3687, longitude: 78.5247 },
];

/* ---------------------------- Drivers (10) -------------------------- */

export const drivers: Driver[] = [
  { id: 'DRV-01', name: 'Ravi Kumar', phone: '+91 98480 11001', email: 'ravi.kumar@liferescue.demo', licenseNo: 'TS09-2019-004512', experienceYears: 9, rating: 4.8, status: 'On Trip', currentAmbulanceId: 'AMB-101', completedTrips: 428, joinedAt: daysAgo(900), location: 'Ameerpet' },
  { id: 'DRV-02', name: 'Suresh Reddy', phone: '+91 98480 11002', email: 'suresh.reddy@liferescue.demo', licenseNo: 'TS09-2017-002233', experienceYears: 12, rating: 4.9, status: 'Available', currentAmbulanceId: 'AMB-102', completedTrips: 651, joinedAt: daysAgo(1400), location: 'Banjara Hills' },
  { id: 'DRV-03', name: 'Mohammed Irfan', phone: '+91 98480 11003', email: 'irfan@liferescue.demo', licenseNo: 'TS10-2020-009871', experienceYears: 7, rating: 4.6, status: 'Available', currentAmbulanceId: 'AMB-103', completedTrips: 312, joinedAt: daysAgo(700), location: 'Musheerabad' },
  { id: 'DRV-04', name: 'Venkatesh Rao', phone: '+91 98480 11004', email: 'venkatesh.rao@liferescue.demo', licenseNo: 'TS08-2016-001129', experienceYears: 15, rating: 4.9, status: 'On Trip', currentAmbulanceId: 'AMB-104', completedTrips: 803, joinedAt: daysAgo(1800), location: 'Jubilee Hills' },
  { id: 'DRV-05', name: 'Anil Sharma', phone: '+91 98480 11005', email: 'anil.sharma@liferescue.demo', licenseNo: 'TS07-2021-014560', experienceYears: 5, rating: 4.4, status: 'Available', currentAmbulanceId: 'AMB-105', completedTrips: 187, joinedAt: daysAgo(520), location: 'Kondapur' },
  { id: 'DRV-06', name: 'Prakash Naidu', phone: '+91 98480 11006', email: 'prakash.naidu@liferescue.demo', licenseNo: 'TS12-2018-003344', experienceYears: 10, rating: 4.7, status: 'Available', currentAmbulanceId: 'AMB-106', completedTrips: 476, joinedAt: daysAgo(1100), location: 'Afzalgunj' },
  { id: 'DRV-07', name: 'Naveen Goud', phone: '+91 98480 11007', email: 'naveen.goud@liferescue.demo', licenseNo: 'TS09-2022-018822', experienceYears: 4, rating: 4.3, status: 'Offline', currentAmbulanceId: 'AMB-107', completedTrips: 121, joinedAt: daysAgo(360), location: 'Secunderabad' },
  { id: 'DRV-08', name: 'Srinivas Yadav', phone: '+91 98480 11008', email: 'srinivas.yadav@liferescue.demo', licenseNo: 'TS11-2015-000918', experienceYears: 17, rating: 5.0, status: 'Available', currentAmbulanceId: 'AMB-108', completedTrips: 942, joinedAt: daysAgo(2100), location: 'Dilsukhnagar' },
  { id: 'DRV-09', name: 'Kiran Deshmukh', phone: '+91 98480 11009', email: 'kiran.d@liferescue.demo', licenseNo: 'TS09-2023-021007', experienceYears: 3, rating: 4.2, status: 'Available', currentAmbulanceId: 'AMB-109', completedTrips: 88, joinedAt: daysAgo(240), location: 'Kukatpally' },
  { id: 'DRV-10', name: 'Rajesh Pillai', phone: '+91 98480 11010', email: 'rajesh.pillai@liferescue.demo', licenseNo: 'TS10-2019-006655', experienceYears: 8, rating: 4.6, status: 'On Trip', currentAmbulanceId: 'AMB-110', completedTrips: 359, joinedAt: daysAgo(820), location: 'Hitech City' },
];

/* --------------------------- Ambulances (12) ------------------------ */

const eq = (list: string[]) => list.map((name) => ({ name, available: true }));

interface AmbSeed {
  id: string; type: AmbulanceType; driverId: string | null; location: string;
  status: Ambulance['status']; equipment: string[]; distanceKm: number;
  etaMinutes: number; hospitalId: string; lat: number; lng: number; progress: number;
}

const ambulanceSeeds: AmbSeed[] = [
  { id: 'AMB-101', type: 'Advanced Life Support', driverId: 'DRV-01', location: 'Ameerpet', status: 'Busy', equipment: ['Oxygen', 'Cardiac Monitor', 'Defibrillator', 'Emergency Equipment', 'Ventilator'], distanceKm: 2.1, etaMinutes: 5, hospitalId: 'HSP-01', lat: 17.4325, lng: 78.4521, progress: 0.62 },
  { id: 'AMB-102', type: 'Basic Life Support', driverId: 'DRV-02', location: 'Banjara Hills', status: 'Available', equipment: ['Oxygen', 'First Aid Kit', 'Stretcher'], distanceKm: 3.6, etaMinutes: 8, hospitalId: 'HSP-02', lat: 17.4155, lng: 78.4425, progress: 0 },
  { id: 'AMB-103', type: 'ICU Ambulance', driverId: 'DRV-03', location: 'Musheerabad', status: 'Available', equipment: ['Ventilator', 'Cardiac Monitor', 'Defibrillator', 'Infusion Pumps', 'Oxygen'], distanceKm: 4.9, etaMinutes: 11, hospitalId: 'HSP-03', lat: 17.4182, lng: 78.4901, progress: 0 },
  { id: 'AMB-104', type: 'Accident Emergency', driverId: 'DRV-04', location: 'Jubilee Hills', status: 'Busy', equipment: ['Spine Board', 'Splints', 'Oxygen', 'Trauma Kit', 'Defibrillator'], distanceKm: 6.3, etaMinutes: 13, hospitalId: 'HSP-04', lat: 17.4210, lng: 78.4162, progress: 0.34 },
  { id: 'AMB-105', type: 'Neonatal Ambulance', driverId: 'DRV-05', location: 'Kondapur', status: 'Available', equipment: ['Neonatal Incubator', 'Ventilator', 'Oxygen', 'Warming Unit'], distanceKm: 8.1, etaMinutes: 17, hospitalId: 'HSP-05', lat: 17.4610, lng: 78.3672, progress: 0 },
  { id: 'AMB-106', type: 'Basic Life Support', driverId: 'DRV-06', location: 'Afzalgunj', status: 'Available', equipment: ['Oxygen', 'First Aid Kit', 'Stretcher', 'Wheelchair'], distanceKm: 5.4, etaMinutes: 12, hospitalId: 'HSP-06', lat: 17.3801, lng: 78.4672, progress: 0 },
  { id: 'AMB-107', type: 'Patient Transport', driverId: 'DRV-07', location: 'Secunderabad', status: 'Offline', equipment: ['Stretcher', 'Wheelchair', 'Oxygen'], distanceKm: 9.7, etaMinutes: 21, hospitalId: 'HSP-07', lat: 17.4391, lng: 78.5012, progress: 0 },
  { id: 'AMB-108', type: 'Advanced Life Support', driverId: 'DRV-08', location: 'Dilsukhnagar', status: 'Busy', equipment: ['Oxygen', 'Cardiac Monitor', 'Defibrillator', 'Ventilator', 'Emergency Equipment'], distanceKm: 7.8, etaMinutes: 16, hospitalId: 'HSP-08', lat: 17.3721, lng: 78.5201, progress: 0.72 },
  { id: 'AMB-109', type: 'Basic Life Support', driverId: 'DRV-09', location: 'Kukatpally', status: 'Available', equipment: ['Oxygen', 'First Aid Kit', 'Stretcher'], distanceKm: 6.9, etaMinutes: 15, hospitalId: 'HSP-01', lat: 17.4842, lng: 78.4132, progress: 0 },
  { id: 'AMB-110', type: 'ICU Ambulance', driverId: 'DRV-10', location: 'Hitech City', status: 'Busy', equipment: ['Ventilator', 'Cardiac Monitor', 'Infusion Pumps', 'Defibrillator'], distanceKm: 10.9, etaMinutes: 22, hospitalId: 'HSP-05', lat: 17.4482, lng: 78.3908, progress: 0.18 },
  { id: 'AMB-111', type: 'Basic Life Support', driverId: null, location: 'Ameerpet', status: 'Maintenance', equipment: ['Oxygen', 'Stretcher'], distanceKm: 3.1, etaMinutes: 7, hospitalId: 'HSP-01', lat: 17.4357, lng: 78.4447, progress: 0 },
  { id: 'AMB-112', type: 'Accident Emergency', driverId: null, location: 'Secunderabad', status: 'Available', equipment: ['Spine Board', 'Splints', 'Trauma Kit', 'Oxygen'], distanceKm: 8.4, etaMinutes: 18, hospitalId: 'HSP-07', lat: 17.4425, lng: 78.4940, progress: 0 },
];

export const ambulances: Ambulance[] = ambulanceSeeds.map((s) => {
  const driver = drivers.find((d) => d.id === s.driverId);
  return {
    id: s.id, type: s.type, driverId: s.driverId,
    driverName: driver ? driver.name : 'Unassigned', location: s.location,
    status: s.status, equipment: eq(s.equipment), distanceKm: s.distanceKm,
    etaMinutes: s.etaMinutes, vehicleNo: `TS 09 E${s.id.slice(4)}`,
    baseHospitalId: s.hospitalId, lastService: daysAgo(20 + Number(s.id.slice(4))),
    latitude: s.lat, longitude: s.lng, routeProgress: s.progress,
  };
});

/* ---------------------------- Patients (15) ------------------------- */

export const patients: Patient[] = [
  { id: 'PAT-001', name: 'Ramesh Babu', age: 58, gender: 'Male', phone: '+91 98765 43201', email: 'ramesh.babu@demo.in', address: '12-3-456, Ameerpet, Hyderabad', bloodGroup: 'B+', emergencyContact: '+91 98765 43901', emergencyContactName: 'Lakshmi Babu (Wife)', allergies: 'Penicillin', conditions: 'Hypertension, Type-2 Diabetes', registeredAt: daysAgo(420) },
  { id: 'PAT-002', name: 'Sneha Reddy', age: 27, gender: 'Female', phone: '+91 98765 43202', email: 'sneha.reddy@demo.in', address: '8-2-120, Banjara Hills, Hyderabad', bloodGroup: 'O+', emergencyContact: '+91 98765 43902', emergencyContactName: 'Anand Reddy (Brother)', registeredAt: daysAgo(310) },
  { id: 'PAT-003', name: 'Abdul Rahman', age: 41, gender: 'Male', phone: '+91 98765 43203', email: 'abdul.rahman@demo.in', address: '5-9-88, Musheerabad, Hyderabad', bloodGroup: 'A+', emergencyContact: '+91 98765 43903', emergencyContactName: 'Fatima Rahman (Mother)', allergies: 'Sulfa drugs', registeredAt: daysAgo(280) },
  { id: 'PAT-004', name: 'Kavitha Rao', age: 34, gender: 'Female', phone: '+91 98765 43204', email: 'kavitha.rao@demo.in', address: 'Road 46, Jubilee Hills, Hyderabad', bloodGroup: 'AB+', emergencyContact: '+91 98765 43904', emergencyContactName: 'Suresh Rao (Husband)', conditions: 'Pregnancy (3rd trimester)', registeredAt: daysAgo(190) },
  { id: 'PAT-005', name: 'Arjun Mehta', age: 9, gender: 'Male', phone: '+91 98765 43205', email: 'arjun.mehta@demo.in', address: 'Kondapur, Hyderabad', bloodGroup: 'B-', emergencyContact: '+91 98765 43905', emergencyContactName: 'Priya Mehta (Mother)', allergies: 'Peanuts', registeredAt: daysAgo(150) },
  { id: 'PAT-006', name: 'Bhaskar Naidu', age: 66, gender: 'Male', phone: '+91 98765 43206', email: 'bhaskar.naidu@demo.in', address: 'Afzalgunj, Hyderabad', bloodGroup: 'O-', emergencyContact: '+91 98765 43906', emergencyContactName: 'Sunitha Naidu (Daughter)', conditions: 'COPD, Cardiac history', registeredAt: daysAgo(360) },
  { id: 'PAT-007', name: 'Meena Kumari', age: 52, gender: 'Female', phone: '+91 98765 43207', email: 'meena.kumari@demo.in', address: 'Secunderabad, Telangana', bloodGroup: 'A-', emergencyContact: '+91 98765 43907', emergencyContactName: 'Ravi Shankar (Son)', conditions: 'Asthma', registeredAt: daysAgo(240) },
  { id: 'PAT-008', name: 'Suresh Chandra', age: 45, gender: 'Male', phone: '+91 98765 43208', email: 'suresh.chandra@demo.in', address: 'Dilsukhnagar, Hyderabad', bloodGroup: 'B+', emergencyContact: '+91 98765 43908', emergencyContactName: 'Geeta Chandra (Wife)', registeredAt: daysAgo(200) },
  { id: 'PAT-009', name: 'Priyanka Joshi', age: 31, gender: 'Female', phone: '+91 98765 43209', email: 'priyanka.joshi@demo.in', address: 'Kukatpally, Hyderabad', bloodGroup: 'O+', emergencyContact: '+91 98765 43909', emergencyContactName: 'Vikram Joshi (Husband)', registeredAt: daysAgo(120) },
  { id: 'PAT-010', name: 'Rahul Verma', age: 23, gender: 'Male', phone: '+91 98765 43210', email: 'rahul.verma@demo.in', address: 'Hitech City, Hyderabad', bloodGroup: 'A+', emergencyContact: '+91 98765 43910', emergencyContactName: 'Neha Verma (Sister)', registeredAt: daysAgo(90) },
  { id: 'PAT-011', name: 'Fatima Begum', age: 70, gender: 'Female', phone: '+91 98765 43211', email: 'fatima.begum@demo.in', address: 'Charminar, Hyderabad', bloodGroup: 'AB-', emergencyContact: '+91 98765 43911', emergencyContactName: 'Imran Khan (Son)', conditions: 'Arthritis, Hypertension', registeredAt: daysAgo(410) },
  { id: 'PAT-012', name: 'Deepak Sharma', age: 38, gender: 'Male', phone: '+91 98765 43212', email: 'deepak.sharma@demo.in', address: 'Miyapur, Hyderabad', bloodGroup: 'B+', emergencyContact: '+91 98765 43912', emergencyContactName: 'Anita Sharma (Wife)', registeredAt: daysAgo(300) },
  { id: 'PAT-013', name: 'Nithya Srinivasan', age: 29, gender: 'Female', phone: '+91 98765 43213', email: 'nithya.s@demo.in', address: 'Begumpet, Hyderabad', bloodGroup: 'O+', emergencyContact: '+91 98765 43913', emergencyContactName: 'Karthik Srinivasan (Husband)', registeredAt: daysAgo(60) },
  { id: 'PAT-014', name: 'Ganesh Patil', age: 61, gender: 'Male', phone: '+91 98765 43214', email: 'ganesh.patil@demo.in', address: 'LB Nagar, Hyderabad', bloodGroup: 'A+', emergencyContact: '+91 98765 43914', emergencyContactName: 'Shalini Patil (Daughter)', conditions: 'Post-bypass patient', registeredAt: daysAgo(520) },
  { id: 'PAT-015', name: 'Zara Sheikh', age: 17, gender: 'Female', phone: '+91 98765 43215', email: 'zara.sheikh@demo.in', address: 'Tolichowki, Hyderabad', bloodGroup: 'B-', emergencyContact: '+91 98765 43915', emergencyContactName: 'Ayesha Sheikh (Mother)', registeredAt: daysAgo(30) },
];

/* ------------------------ Users (demo login) ------------------------ */

export const users: User[] = [
  { id: 'USR-01', name: 'Ramesh Babu', email: 'patient@demo.in', phone: '+91 98765 43201', role: 'patient', password: 'patient123', address: '12-3-456, Ameerpet, Hyderabad', emergencyContact: '+91 98765 43901', createdAt: daysAgo(420) },
  { id: 'USR-02', name: 'Ravi Kumar', email: 'driver@demo.in', phone: '+91 98480 11001', role: 'driver', password: 'driver123', address: 'Ameerpet, Hyderabad', emergencyContact: '+91 98480 11999', createdAt: daysAgo(900) },
  { id: 'USR-03', name: 'Dr. Anita Menon', email: 'hospital@demo.in', phone: '+91 40 2345 6701', role: 'hospital', password: 'hospital123', address: 'City Emergency Hospital, Ameerpet', emergencyContact: '+91 98480 11888', createdAt: daysAgo(1200) },
  { id: 'USR-04', name: 'System Administrator', email: 'admin@demo.in', phone: '+91 98480 11777', role: 'admin', password: 'admin123', address: 'LifeRescue Command Centre, Hyderabad', emergencyContact: '+91 98480 11666', createdAt: daysAgo(1500) },
];

/* ------------------------- Emergency contacts ----------------------- */

export const emergencyContacts: EmergencyContact[] = [
  { id: 'EC-01', name: 'Lakshmi Babu', relationship: 'Wife', phone: '+91 98765 43901', email: 'lakshmi.babu@demo.in', primary: true },
  { id: 'EC-02', name: 'Suresh Babu', relationship: 'Brother', phone: '+91 98765 43921', email: 'suresh.babu@demo.in', primary: false },
  { id: 'EC-03', name: 'Dr. K. Prasad', relationship: 'Family Doctor', phone: '+91 98490 33112', email: 'dr.prasad@demo.in', primary: false },
  { id: 'EC-04', name: 'Anjali Sharma', relationship: 'Neighbour', phone: '+91 98765 43941', email: 'anjali.sharma@demo.in', primary: false },
];

/* ----------------------- Emergency requests (22) -------------------- */

interface ReqSeed {
  id: string; patientName: string; age: number; phone: string; location: string;
  type: EmergencyType; symptoms: string; priority: Priority;
  status: EmergencyRequest['status']; ambulanceId: string | null;
  hospitalId: string | null; createdHoursAgo: number; response: number;
  accident?: boolean; conscious?: boolean; breathing?: boolean; bleeding?: boolean; ai: string;
}

const requestSeeds: ReqSeed[] = [
  { id: 'EMR-2041', patientName: 'Ramesh Babu', age: 58, phone: '+91 98765 43201', location: 'Ameerpet, Hyderabad', type: 'Chest Pain', symptoms: 'Severe chest pain radiating to left arm, sweating heavily, shortness of breath.', priority: 'critical', status: 'Completed', ambulanceId: 'AMB-101', hospitalId: 'HSP-01', createdHoursAgo: 26, response: 6, conscious: true, breathing: true, ai: 'Symptoms consistent with a possible cardiac event. Classified CRITICAL — immediate advanced life support and hospital pre-alert recommended.' },
  { id: 'EMR-2042', patientName: 'Sneha Reddy', age: 27, phone: '+91 98765 43202', location: 'Banjara Hills, Hyderabad', type: 'Accident', symptoms: 'Two-wheeler collision, road rash on right leg, mild head impact, conscious.', priority: 'urgent', status: 'Completed', ambulanceId: 'AMB-104', hospitalId: 'HSP-02', createdHoursAgo: 23, response: 9, accident: true, conscious: true, ai: 'Trauma with possible head impact. Classified URGENT — trauma-capable transport and precautionary cervical spine support.' },
  { id: 'EMR-2043', patientName: 'Abdul Rahman', age: 41, phone: '+91 98765 43203', location: 'Musheerabad, Hyderabad', type: 'Breathing Problem', symptoms: 'Sudden breathlessness, wheezing, unable to speak full sentences.', priority: 'critical', status: 'Completed', ambulanceId: 'AMB-103', hospitalId: 'HSP-03', createdHoursAgo: 20, response: 8, conscious: true, breathing: true, ai: 'Severe respiratory distress reported. Classified CRITICAL — oxygen support and respiratory monitoring required en route.' },
  { id: 'EMR-2044', patientName: 'Kavitha Rao', age: 34, phone: '+91 98765 43204', location: 'Jubilee Hills, Hyderabad', type: 'Pregnancy Emergency', symptoms: 'Contractions started early, mild bleeding, 34 weeks pregnant.', priority: 'critical', status: 'Completed', ambulanceId: 'AMB-102', hospitalId: 'HSP-08', createdHoursAgo: 18, response: 7, conscious: true, ai: 'Obstetric emergency at 34 weeks. Classified CRITICAL — neonatal-capable hospital and obstetric team pre-alert.' },
  { id: 'EMR-2045', patientName: 'Arjun Mehta', age: 9, phone: '+91 98765 43205', location: 'Kondapur, Hyderabad', type: 'Child Emergency', symptoms: 'High fever 103°F, febrile seizure lasting ~1 minute, now drowsy.', priority: 'critical', status: 'Completed', ambulanceId: 'AMB-105', hospitalId: 'HSP-05', createdHoursAgo: 16, response: 10, conscious: false, ai: 'Pediatric febrile seizure with post-ictal drowsiness. Classified CRITICAL — paediatric emergency transport.' },
  { id: 'EMR-2046', patientName: 'Bhaskar Naidu', age: 66, phone: '+91 98765 43206', location: 'Afzalgunj, Hyderabad', type: 'Breathing Problem', symptoms: 'Known COPD, worsening breathlessness since morning, using inhaler with little relief.', priority: 'urgent', status: 'Completed', ambulanceId: 'AMB-106', hospitalId: 'HSP-06', createdHoursAgo: 14, response: 11, conscious: true, breathing: true, ai: 'Acute exacerbation of COPD. Classified URGENT — oxygen therapy and respiratory support in transit.' },
  { id: 'EMR-2047', patientName: 'Meena Kumari', age: 52, phone: '+91 98765 43207', location: 'Secunderabad, Telangana', type: 'Burn Injury', symptoms: 'Hot oil spill on left forearm and chest, blistering, severe pain.', priority: 'urgent', status: 'Completed', ambulanceId: 'AMB-112', hospitalId: 'HSP-03', createdHoursAgo: 12, response: 13, conscious: true, ai: 'Partial-thickness thermal burns. Classified URGENT — burns unit referral and sterile dressing en route.' },
  { id: 'EMR-2048', patientName: 'Suresh Chandra', age: 45, phone: '+91 98765 43208', location: 'Dilsukhnagar, Hyderabad', type: 'Unconsciousness', symptoms: 'Found collapsed in office, unresponsive but breathing, no known history.', priority: 'critical', status: 'Completed', ambulanceId: 'AMB-108', hospitalId: 'HSP-07', createdHoursAgo: 10, response: 6, conscious: false, ai: 'Unresponsive patient with preserved breathing. Classified CRITICAL — airway protection and rapid neuro assessment.' },
  { id: 'EMR-2049', patientName: 'Priyanka Joshi', age: 31, phone: '+91 98765 43209', location: 'Kukatpally, Hyderabad', type: 'Severe Bleeding', symptoms: 'Deep cut on palm from kitchen knife, bleeding not stopping with pressure.', priority: 'urgent', status: 'Completed', ambulanceId: 'AMB-109', hospitalId: 'HSP-01', createdHoursAgo: 8, response: 9, conscious: true, bleeding: true, ai: 'Uncontrolled haemorrhage from extremity wound. Classified URGENT — haemorrhage control and tetanus prophylaxis.' },
  { id: 'EMR-2050', patientName: 'Rahul Verma', age: 23, phone: '+91 98765 43210', location: 'Hitech City, Hyderabad', type: 'Accident', symptoms: 'Bike skid at speed, suspected fracture of right forearm, conscious and alert.', priority: 'urgent', status: 'Completed', ambulanceId: 'AMB-110', hospitalId: 'HSP-05', createdHoursAgo: 7, response: 12, accident: true, conscious: true, ai: 'Closed forearm fracture after road traffic accident. Classified URGENT — limb immobilisation and orthopaedic referral.' },
  { id: 'EMR-2051', patientName: 'Fatima Begum', age: 70, phone: '+91 98765 43211', location: 'Charminar, Hyderabad', type: 'Other', symptoms: 'Sudden giddiness and vomiting, unable to stand, history of hypertension.', priority: 'urgent', status: 'Completed', ambulanceId: 'AMB-102', hospitalId: 'HSP-07', createdHoursAgo: 6, response: 10, conscious: true, ai: 'Acute vertigo with vomiting in a hypertensive elderly patient. Classified URGENT — falls risk and hydration support.' },
  { id: 'EMR-2052', patientName: 'Deepak Sharma', age: 38, phone: '+91 98765 43212', location: 'Miyapur, Hyderabad', type: 'Chest Pain', symptoms: 'Tightness in chest after exertion, mild, relieved by rest.', priority: 'urgent', status: 'Completed', ambulanceId: 'AMB-103', hospitalId: 'HSP-04', createdHoursAgo: 5, response: 11, conscious: true, ai: 'Exertional chest tightness. Classified URGENT — ECG monitoring and cardiac evaluation on arrival.' },
  { id: 'EMR-2053', patientName: 'Nithya Srinivasan', age: 29, phone: '+91 98765 43213', location: 'Begumpet, Hyderabad', type: 'Other', symptoms: 'Severe migraine with photophobia, no red-flag neurological signs.', priority: 'non-critical', status: 'Completed', ambulanceId: 'AMB-109', hospitalId: 'HSP-01', createdHoursAgo: 4, response: 14, conscious: true, ai: 'Severe migraine without neurological deficit. Classified NON-CRITICAL — comfortable transport and analgesia.' },
  { id: 'EMR-2054', patientName: 'Ganesh Patil', age: 61, phone: '+91 98765 43214', location: 'LB Nagar, Hyderabad', type: 'Breathing Problem', symptoms: 'Fluid overload suspected, breathless on lying flat, post-bypass patient.', priority: 'critical', status: 'Going To Hospital', ambulanceId: 'AMB-108', hospitalId: 'HSP-07', createdHoursAgo: 2, response: 7, conscious: true, breathing: true, ai: 'Likely acute decompensated heart failure. Classified CRITICAL — cardiac ICU pre-alert advised.' },
  { id: 'EMR-2055', patientName: 'Zara Sheikh', age: 17, phone: '+91 98765 43215', location: 'Tolichowki, Hyderabad', type: 'Severe Bleeding', symptoms: 'Menorrhagia with dizziness on standing, heavy bleeding for 2 days.', priority: 'urgent', status: 'Patient Picked Up', ambulanceId: 'AMB-102', hospitalId: 'HSP-08', createdHoursAgo: 1, response: 8, conscious: true, bleeding: true, ai: 'Significant blood loss with postural dizziness. Classified URGENT — volume assessment and haemoglobin check.' },
  { id: 'EMR-2056', patientName: 'Ramesh Babu', age: 58, phone: '+91 98765 43201', location: 'Ameerpet, Hyderabad', type: 'Unconsciousness', symptoms: 'Sudden collapse at home, unresponsive, family reports low sugar history.', priority: 'critical', status: 'On The Way', ambulanceId: 'AMB-101', hospitalId: 'HSP-01', createdHoursAgo: 0.4, response: 4, conscious: false, ai: 'Collapse with suspected hypoglycaemia. Classified CRITICAL — check capillary glucose and protect airway.' },
  { id: 'EMR-2057', patientName: 'Sneha Reddy', age: 27, phone: '+91 98765 43202', location: 'Banjara Hills, Hyderabad', type: 'Accident', symptoms: 'Car rear-ended at traffic signal, neck pain and stiffness, fully conscious.', priority: 'urgent', status: 'Driver Accepted', ambulanceId: 'AMB-104', hospitalId: 'HSP-02', createdHoursAgo: 0.25, response: 5, accident: true, conscious: true, ai: 'Whiplash-type neck injury. Classified URGENT — cervical collar and spine precautions.' },
  { id: 'EMR-2058', patientName: 'Abdul Rahman', age: 41, phone: '+91 98765 43203', location: 'Musheerabad, Hyderabad', type: 'Chest Pain', symptoms: 'Central chest pressure, feels like heaviness, mild sweating.', priority: 'urgent', status: 'Assigned', ambulanceId: 'AMB-103', hospitalId: 'HSP-03', createdHoursAgo: 0.12, response: 5, conscious: true, ai: 'Suspected unstable angina. Classified URGENT — ECG within 10 minutes of contact.' },
  { id: 'EMR-2059', patientName: 'Kavitha Rao', age: 34, phone: '+91 98765 43204', location: 'Jubilee Hills, Hyderabad', type: 'Pregnancy Emergency', symptoms: 'Reduced fetal movements noticed since last night, no pain.', priority: 'urgent', status: 'Requested', ambulanceId: null, hospitalId: null, createdHoursAgo: 0.06, response: 0, conscious: true, ai: 'Reduced fetal movements at 34 weeks. Classified URGENT — obstetric assessment and CTG monitoring.' },
  { id: 'EMR-2060', patientName: 'Arjun Mehta', age: 9, phone: '+91 98765 43205', location: 'Kondapur, Hyderabad', type: 'Child Emergency', symptoms: 'Fell from swing, swelling on left elbow, crying, no loss of consciousness.', priority: 'urgent', status: 'Requested', ambulanceId: null, hospitalId: null, createdHoursAgo: 0.03, response: 0, conscious: true, accident: true, ai: 'Suspected paediatric elbow injury. Classified URGENT — immobilisation and paediatric orthopaedic review.' },
  { id: 'EMR-2061', patientName: 'Meena Kumari', age: 52, phone: '+91 98765 43207', location: 'Secunderabad, Telangana', type: 'Breathing Problem', symptoms: 'Asthma attack after dust exposure, using reliever inhaler, improving slowly.', priority: 'urgent', status: 'Completed', ambulanceId: 'AMB-106', hospitalId: 'HSP-03', createdHoursAgo: 30, response: 10, conscious: true, breathing: true, ai: 'Acute asthma exacerbation responding to inhaler. Classified URGENT — monitor peak flow in transit.' },
  { id: 'EMR-2062', patientName: 'Suresh Chandra', age: 45, phone: '+91 98765 43208', location: 'Dilsukhnagar, Hyderabad', type: 'Burn Injury', symptoms: 'Minor scald from steam on right hand, small blistered area.', priority: 'non-critical', status: 'Cancelled', ambulanceId: null, hospitalId: null, createdHoursAgo: 28, response: 0, conscious: true, ai: 'Superficial steam scald. Classified NON-CRITICAL — self-transport to outpatient burns clinic appropriate.' },
];

const STAGES: EmergencyRequest['status'][] = [
  'Requested', 'Assigned', 'Driver Accepted', 'On The Way', 'Arrived At Patient',
  'Patient Picked Up', 'Going To Hospital', 'Arrived At Hospital', 'Handover Complete', 'Completed',
];

export const emergencyRequests: EmergencyRequest[] = requestSeeds.map((s) => {
  const created = hoursAgo(s.createdHoursAgo);
  const idx = STAGES.indexOf(s.status);
  const used = idx >= 0 ? STAGES.slice(0, idx + 1) : ['Requested' as EmergencyRequest['status']];
  return {
    id: s.id,
    patientId: patients.find((p) => p.name === s.patientName)?.id ?? null,
    patientName: s.patientName, patientAge: s.age, phone: s.phone,
    location: s.location, emergencyType: s.type, symptoms: s.symptoms,
    isAccident: !!s.accident, isConscious: s.conscious ?? true,
    breathingDifficulty: !!s.breathing, severeBleeding: !!s.bleeding,
    emergencyContact: '+91 98765 43901', priority: s.priority, aiSummary: s.ai,
    status: s.status, ambulanceId: s.ambulanceId, hospitalId: s.hospitalId,
    createdAt: created,
    completedAt: s.status === 'Completed' ? hoursAgo(Math.max(0, s.createdHoursAgo - 1)) : undefined,
    responseTimeMinutes: s.response || undefined,
    timeline: used.map((status, i) => ({ status, at: hoursAgo(Math.max(0, s.createdHoursAgo - i * 0.08)) })),
    vitals: {
      heartRate: s.priority === 'critical' ? 118 + (s.age % 14) : 84 + (s.age % 18),
      spo2: s.priority === 'critical' ? 89 + (s.age % 4) : 96 + (s.age % 3),
      systolic: s.priority === 'critical' ? 148 : 122,
      diastolic: s.priority === 'critical' ? 94 : 78,
      temperature: Number((36.8 + (s.age % 10) / 20).toFixed(1)),
      respiratoryRate: s.priority === 'critical' ? 26 : 17,
      recordedAt: created,
    },
  };
});

/* ------------------------ Completed trips (12) ---------------------- */

export const completedTrips: CompletedTrip[] = emergencyRequests
  .filter((r) => r.status === 'Completed')
  .map((r, i) => {
    const amb = ambulances.find((a) => a.id === r.ambulanceId);
    const hsp = hospitals.find((h) => h.id === r.hospitalId);
    return {
      id: `TRP-${3001 + i}`, requestId: r.id, date: r.createdAt,
      patientName: r.patientName, emergencyType: r.emergencyType,
      ambulanceId: r.ambulanceId ?? 'AMB-101', driverName: amb?.driverName ?? 'Ravi Kumar',
      hospitalName: hsp?.name ?? 'City Emergency Hospital',
      responseTimeMinutes: r.responseTimeMinutes ?? 8,
      tripDurationMinutes: 18 + ((i * 7) % 26), status: 'Completed' as const,
      distanceKm: Number((2 + ((i * 13) % 90) / 10).toFixed(1)),
      rating: Number(Math.min(5, 4 + (i % 5) / 5).toFixed(1)),
    };
  });

/* ------------------------ Notifications (22) ------------------------ */

const notif = (
  id: number, type: AppNotification['type'], title: string, message: string,
  hours: number, read: boolean, audience: AppNotification['audience'], link?: string,
): AppNotification => ({
  id: `NTF-${id}`, type, title, message, read,
  createdAt: minutesAgo(Math.round(hours * 60)), audience, link,
});

export const notifications: AppNotification[] = [
  notif(1001, 'emergency', '🚨 Emergency request accepted', 'EMR-2056 for Ramesh Babu has been accepted by driver Ravi Kumar (AMB-101).', 0.4, false, 'patient', '/patient'),
  notif(1002, 'ambulance', '📍 Ambulance is 2 km away', 'AMB-101 is approximately 2 km from your location. ETA 4 minutes.', 0.3, false, 'patient', '/track'),
  notif(1003, 'hospital', '🏥 Hospital has been notified', 'City Emergency Hospital has been pre-alerted for EMR-2056 (Critical).', 0.5, false, 'patient', '/patient'),
  notif(1004, 'emergency', '🆘 New critical request EMR-2056', 'Unconsciousness reported at Ameerpet. Priority: CRITICAL.', 0.5, false, 'admin', '/admin'),
  notif(1005, 'ambulance', '🚑 Ambulance assigned', 'AMB-103 assigned to EMR-2058. Driver: Mohammed Irfan.', 0.2, false, 'patient', '/track'),
  notif(1006, 'info', '🚑 Ambulance dispatched to you', 'EMR-2057 — AMB-104 dispatched for Sneha Reddy, Banjara Hills.', 0.3, true, 'patient', '/track'),
  notif(1007, 'success', '✓ Patient arrived at hospital', 'EMR-2047 (Meena Kumari) reached Gandhi General Hospital and handover started.', 1, true, 'patient', '/history'),
  notif(1008, 'hospital', '🚨 Emergency patient incoming', 'Incoming CRITICAL patient EMR-2054. ETA 6 minutes. Required: ICU.', 0.8, false, 'hospital', '/hospital'),
  notif(1009, 'info', '🧑‍⚕️ Incoming patient acknowledged', 'Ganesh Patil (EMR-2054) acknowledged by City Emergency Hospital ED team.', 0.7, true, 'hospital', '/hospital'),
  notif(1010, 'emergency', '📋 New emergency request EMR-2059', 'Kavitha Rao — Pregnancy Emergency. Priority: URGENT.', 0.2, false, 'admin', '/admin'),
  notif(1011, 'emergency', '📋 New emergency request EMR-2060', 'Arjun Mehta — Child Emergency. Priority: URGENT.', 0.1, false, 'admin', '/admin'),
  notif(1012, 'ambulance', '🛠️ AMB-111 moved to maintenance', 'Scheduled preventive maintenance for AMB-111. Return to service in 4 hours.', 3, true, 'admin', '/ambulances'),
  notif(1013, 'success', '✓ Trip TRP-3008 completed', 'EMR-2048 completed successfully. Response time 6 minutes.', 9, true, 'admin', '/history'),
  notif(1014, 'info', '👤 New patient registered', 'Nithya Srinivasan completed registration with blood group O+.', 5, true, 'admin', '/patients'),
  notif(1015, 'success', '✓ Trip completed', 'Your EMR-2049 trip (severe bleeding) completed at City Emergency Hospital.', 7, true, 'patient', '/history'),
  notif(1016, 'info', '📞 Emergency contact notified', 'Lakshmi Babu was notified about your EMR-2041 emergency.', 25, true, 'patient', '/contacts'),
  notif(1017, 'info', '⚠️ Response time above target', 'Average response time for the last hour is 14 minutes (target 10 minutes).', 2, false, 'admin', '/analytics'),
  notif(1018, 'hospital', '🛏️ ICU occupancy update', 'City Emergency Hospital ICU occupancy at 75% (18/24 beds).', 4, true, 'hospital', '/hospital'),
  notif(1019, 'info', '🔔 Shift change reminder', 'Driver Ravi Kumar — shift ends in 45 minutes. Handover pending.', 1.5, true, 'driver', '/driver'),
  notif(1020, 'emergency', '🚑 New trip assigned', 'EMR-2057 assigned to you. Pickup: Banjara Hills (3.4 km).', 0.3, false, 'driver', '/driver'),
  notif(1021, 'success', '✓ Trip completed — payout updated', 'AMB-108 completed TRP-3009. 942 total trips completed.', 6, true, 'driver', '/driver'),
  notif(1022, 'info', '📊 Weekly report ready', 'Emergency response analytics for this week is now available.', 12, true, 'admin', '/analytics'),
];

/* -------------------------- Analytics seed -------------------------- */

export const analytics = {
  emergencyRequests7d: [
    { label: 'Mon', value: 18 }, { label: 'Tue', value: 24 }, { label: 'Wed', value: 21 },
    { label: 'Thu', value: 29 }, { label: 'Fri', value: 34 }, { label: 'Sat', value: 41 },
    { label: 'Sun', value: 27 },
  ],
  dailyUsage7d: [
    { label: 'Mon', value: 14 }, { label: 'Tue', value: 19 }, { label: 'Wed', value: 17 },
    { label: 'Thu', value: 23 }, { label: 'Fri', value: 27 }, { label: 'Sat', value: 33 },
    { label: 'Sun', value: 22 },
  ],
  responseTimes7d: [
    { label: 'Mon', value: 9 }, { label: 'Tue', value: 8 }, { label: 'Wed', value: 11 },
    { label: 'Thu', value: 7 }, { label: 'Fri', value: 10 }, { label: 'Sat', value: 6 },
    { label: 'Sun', value: 8 },
  ],
  emergencyCategories: [
    { label: 'Accident', value: 26, color: '#e11d48' },
    { label: 'Chest Pain', value: 19, color: '#ea580c' },
    { label: 'Breathing Problem', value: 17, color: '#2563eb' },
    { label: 'Unconsciousness', value: 11, color: '#7c3aed' },
    { label: 'Severe Bleeding', value: 9, color: '#dc2626' },
    { label: 'Other', value: 18, color: '#0891b2' },
  ],
  completedTripsMonthly: [
    { label: 'Wk 1', value: 112 }, { label: 'Wk 2', value: 138 },
    { label: 'Wk 3', value: 126 }, { label: 'Wk 4', value: 154 },
  ],
};

/* --------------------------- Catalogues ----------------------------- */

export const equipmentCatalogue = [
  'Oxygen', 'Cardiac Monitor', 'Defibrillator', 'Ventilator', 'Infusion Pumps',
  'Spine Board', 'Splints', 'Trauma Kit', 'Neonatal Incubator', 'Warming Unit',
  'Stretcher', 'Wheelchair', 'First Aid Kit', 'Emergency Equipment',
];

export const ambulanceTypes: AmbulanceType[] = [
  'Basic Life Support', 'Advanced Life Support', 'ICU Ambulance',
  'Neonatal Ambulance', 'Patient Transport', 'Accident Emergency',
];

export const emergencyTypes: EmergencyType[] = [
  'Accident', 'Chest Pain', 'Breathing Problem', 'Unconsciousness',
  'Severe Bleeding', 'Burn Injury', 'Pregnancy Emergency', 'Child Emergency', 'Other',
];

export const locations = [
  'Ameerpet', 'Banjara Hills', 'Musheerabad', 'Jubilee Hills', 'Kondapur',
  'Afzalgunj', 'Secunderabad', 'Dilsukhnagar', 'Kukatpally', 'Hitech City',
  'Begumpet', 'LB Nagar', 'Tolichowki', 'Miyapur', 'Charminar',
];

/** Route waypoints (normalised 0..100) used by the simulated map. */
export const demoRoute = {
  patient: { x: 18, y: 72 },
  ambulanceStart: { x: 76, y: 20 },
  hospital: { x: 84, y: 80 },
  waypoints: [
    { x: 76, y: 20 }, { x: 66, y: 28 }, { x: 58, y: 24 }, { x: 48, y: 36 },
    { x: 40, y: 46 }, { x: 30, y: 58 }, { x: 22, y: 66 }, { x: 18, y: 72 },
    { x: 30, y: 78 }, { x: 44, y: 82 }, { x: 58, y: 86 }, { x: 70, y: 84 },
    { x: 84, y: 80 },
  ],
};