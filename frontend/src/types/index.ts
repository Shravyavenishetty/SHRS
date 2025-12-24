// Core type definitions for the application

export interface User {
    id: number;
    email: string;
    username: string;
    role: Role;
    is_active: boolean;
    created_at: string;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
}

export interface Patient {
    id: number;
    user_id: number;
    doctor_id?: number;
    first_name: string;
    last_name: string;
    age: number;
    gender: string;
    phone: string;
    email?: string;
    address: string;
    medical_history?: string;
    is_active: boolean;
    date_registered: string;
}

export interface Doctor {
    id: number;
    user_id: number;
    name: string;
    specialty: string;
    email: string;
    contact: string;
    experience: number;
    hospital?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    patient?: Patient;
    doctor?: Doctor;
    appointment_date: string;
    appointment_time?: string;
    reason: string;
    status: 'pending' | 'confirmed' | 'canceled' | 'completed';
    created_at: string;
}

export interface MedicalRecord {
    id: number;
    patient_id: number;
    doctor_id: number;
    diagnosis: string;
    treatment: string;
    prescribed_medicines?: string;
    visit_date: string;
    notes?: string;
}

export interface Prescription {
    id: number;
    patient_id: number;
    doctor_id: number;
    medicine_name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
    notes?: string;
}

export interface Medicine {
    id: number;
    name: string;
    description?: string;
    manufacturer?: string;
    dosage_form?: string;
    price: number;
    stock: number;
    stock_quantity?: number;
    expiry_date: string;
    created_at: string;
}

// API Response types
export interface LoginRequest {
    username: string;  // email
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'doctor' | 'patient';
}

export interface ApiError {
    detail: string;
}

// Utility types
export type RoleName = 'admin' | 'doctor' | 'patient';
