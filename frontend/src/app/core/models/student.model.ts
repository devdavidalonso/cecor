// src/app/core/models/student.model.ts

export interface Address {
  id?: number;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface User {
  id?: number;
  keycloakUserId?: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone: string;
  address?: Address;
  profile: "student" | "admin" | "professor";
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id?: number;
  userId?: number;
  user: User;
  registrationNumber: string;
  status: "active" | "inactive" | "suspended";
  specialNeeds?: string;
  medicalInfo?: string;
  // Deprecated fields removed
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentRequest {
  user: {
    name: string;
    email: string;
    cpf: string;
    birthDate: string;
    phone: string;
    address: Address;
    profile: "student";
    active: boolean;
    password: string;
  };
  registrationNumber: string;
  status: "active" | "inactive" | "suspended";
  specialNeeds?: string;
  medicalInfo?: string;
  notes?: string;
}

export interface UpdateStudentRequest {
  user?: Partial<Omit<User, "id" | "keycloakUserId" | "profile">>;
  registrationNumber?: string;
  status?: "active" | "inactive" | "suspended";
  specialNeeds?: string;
  medicalInfo?: string;
  notes?: string;
}

export type StudentStatus = "active" | "inactive" | "suspended";

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  suspended: "Suspenso",
};

// Guardian interface (for future use)
export interface Guardian {
  id: number;
  studentId: number;
  name: string;
  email?: string;
  cpf?: string;
  relationship: string;
  phones: {
    number: string;
    type: "personal" | "work" | "home";
  }[];
  permissions: {
    pickupStudent: boolean;
    receiveNotifications: boolean;
    authorizeActivities: boolean;
  };
}
