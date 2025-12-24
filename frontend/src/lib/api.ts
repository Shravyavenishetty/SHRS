import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from './config';
import type { LoginRequest, LoginResponse, RegisterRequest, User, Patient, Doctor, Appointment, MedicalRecord, Prescription, Medicine } from '@/types';

class APIClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.apiUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = this.getToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid, clear auth and redirect to login
                    this.clearAuth();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(config.tokenKey);
        }
        return null;
    }

    private setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(config.tokenKey, token);
        }
    }

    private clearAuth(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(config.tokenKey);
            localStorage.removeItem(config.userKey);
        }
    }

    // Auth API
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await this.client.post<LoginResponse>('/auth/token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        this.setToken(response.data.access_token);
        return response.data;
    }

    async register(data: RegisterRequest): Promise<User> {
        const response = await this.client.post<User>('/auth/register', data);
        return response.data;
    }

    logout(): void {
        this.clearAuth();
    }

    // Users API
    async getUsers(): Promise<User[]> {
        const response = await this.client.get<User[]>('/api/users');
        return response.data;
    }

    async getUserById(id: number): Promise<User> {
        const response = await this.client.get<User>(`/api/users/${id}`);
        return response.data;
    }

    // Patients API
    async getPatients(): Promise<Patient[]> {
        const response = await this.client.get<Patient[]>('/patients');
        return response.data;
    }

    async getPatientById(id: number): Promise<Patient> {
        const response = await this.client.get<Patient>(`/patients/${id}`);
        return response.data;
    }

    async createPatient(data: Partial<Patient>): Promise<Patient> {
        const response = await this.client.post<Patient>('/patients', data);
        return response.data;
    }

    async updatePatient(id: number, data: Partial<Patient>): Promise<Patient> {
        const response = await this.client.put<Patient>(`/patients/${id}`, data);
        return response.data;
    }

    async deletePatient(id: number): Promise<void> {
        await this.client.delete(`/patients/${id}`);
    }

    // Doctors API
    async getDoctors(): Promise<Doctor[]> {
        const response = await this.client.get<Doctor[]>('/doctors');
        return response.data;
    }

    async getDoctorById(id: number): Promise<Doctor> {
        const response = await this.client.get<Doctor>(`/doctors/${id}`);
        return response.data;
    }

    async createDoctor(data: Partial<Doctor>): Promise<Doctor> {
        const response = await this.client.post<Doctor>('/doctors', data);
        return response.data;
    }

    async updateDoctor(id: number, data: Partial<Doctor>): Promise<Doctor> {
        const response = await this.client.put<Doctor>(`/doctors/${id}`, data);
        return response.data;
    }

    async deleteDoctor(id: number): Promise<void> {
        await this.client.delete(`/doctors/${id}`);
    }

    // Appointments API
    async getAppointments(): Promise<Appointment[]> {
        const response = await this.client.get<Appointment[]>('/api/appointments');
        return response.data;
    }

    async getAppointmentsByDoctor(): Promise<Appointment[]> {
        const response = await this.client.get<Appointment[]>('/appointments/doctor');
        return response.data;
    }

    async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
        const response = await this.client.get<Appointment[]>(`/appointments/patient/${patientId}`);
        return response.data;
    }

    async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
        const response = await this.client.post<Appointment>('/appointments', data);
        return response.data;
    }

    async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment> {
        const response = await this.client.put<Appointment>(`/appointments/${id}`, data);
        return response.data;
    }

    // Medical Records API
    async getMedicalRecords(): Promise<MedicalRecord[]> {
        const response = await this.client.get<MedicalRecord[]>('/medical_records');
        return response.data;
    }

    async getMedicalRecordById(id: number): Promise<MedicalRecord> {
        const response = await this.client.get<MedicalRecord>(`/medical_records/${id}`);
        return response.data;
    }

    async createMedicalRecord(data: Partial<MedicalRecord>): Promise<MedicalRecord> {
        const response = await this.client.post<MedicalRecord>('/medical_records', data);
        return response.data;
    }

    async updateMedicalRecord(id: number, data: Partial<MedicalRecord>): Promise<MedicalRecord> {
        const response = await this.client.put<MedicalRecord>(`/medical_records/${id}`, data);
        return response.data;
    }

    async deleteMedicalRecord(id: number): Promise<void> {
        await this.client.delete(`/medical_records/${id}`);
    }

    // Prescriptions API
    async getPrescriptions(): Promise<Prescription[]> {
        const response = await this.client.get<Prescription[]>('/prescriptions');
        return response.data;
    }

    async getPrescriptionById(id: number): Promise<Prescription> {
        const response = await this.client.get<Prescription>(`/prescriptions/${id}`);
        return response.data;
    }

    async createPrescription(data: Partial<Prescription>): Promise<Prescription> {
        const response = await this.client.post<Prescription>('/prescriptions', data);
        return response.data;
    }

    async updatePrescription(id: number, data: Partial<Prescription>): Promise<Prescription> {
        const response = await this.client.put<Prescription>(`/prescriptions/${id}`, data);
        return response.data;
    }

    async deletePrescription(id: number): Promise<void> {
        await this.client.delete(`/prescriptions/${id}`);
    }

    // Medicines API
    async getMedicines(): Promise<Medicine[]> {
        const response = await this.client.get<Medicine[]>('/medicines');
        return response.data;
    }

    async getMedicineById(id: number): Promise<Medicine> {
        const response = await this.client.get<Medicine>(`/medicines/${id}`);
        return response.data;
    }

    async createMedicine(data: Partial<Medicine>): Promise<Medicine> {
        const response = await this.client.post<Medicine>('/medicines', data);
        return response.data;
    }

    async updateMedicine(id: number, data: Partial<Medicine>): Promise<Medicine> {
        const response = await this.client.put<Medicine>(`/medicines/${id}`, data);
        return response.data;
    }

    async deleteMedicine(id: number): Promise<void> {
        await this.client.delete(`/medicines/${id}`);
    }
}

// Export singleton instance
export const apiClient = new APIClient();
