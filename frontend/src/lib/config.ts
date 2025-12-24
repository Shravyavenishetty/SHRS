// Configuration constants
export const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    tokenKey: 'shrs_auth_token',
    userKey: 'shrs_user_data',
    appName: 'Swecha Health Records System',
    appVersion: '1.0.0',
} as const;

export const API_ENDPOINTS = {
    // Auth
    login: '/auth/token',
    register: '/auth/register',
    logout: '/auth/logout',

    // Patients
    patients: '/patients',
    patientById: (id: number) => `/patients/${id}`,

    // Doctors
    doctors: '/doctors',
    doctorById: (id: number) => `/doctors/${id}`,

    // Appointments
    appointments: '/appointments',
    appointmentById: (id: number) => `/appointments/${id}`,
    appointmentsByPatient: (id: number) => `/appointments/patient/${id}`,
    appointmentsByDoctor: '/appointments/doctor',

    // Medical Records
    medicalRecords: '/medical_records',
    medicalRecordById: (id: number) => `/medical_records/${id}`,

    // Prescriptions
    prescriptions: '/prescriptions',
    prescriptionById: (id: number) => `/prescriptions/${id}`,

    // Medicines
    medicines: '/medicines',
    medicineById: (id: number) => `/medicines/${id}`,
} as const;
