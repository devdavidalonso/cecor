// src/app/core/models/student.model.ts

export interface Student {
    id: number;
    name: string;
    email: string;
    birthDate: Date;
    cpf: string;
    mainPhone: string;
    address: string;
    photoUrl?: string;
    additionalPhones?: string[];
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
    medicalInfo?: string;
    accessibilityNeeds?: string;
    observation?: string;
    status: 'active' | 'inactive' | 'suspended';
    registrationNumber: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Guardian {
    id: number;
    studentId: number;
    name: string;
    email?: string;
    cpf?: string;
    relationship: string;
    phones: {
      number: string;
      type: 'personal' | 'work' | 'home';
    }[];
    permissions: {
      pickupStudent: boolean;
      receiveNotifications: boolean;
      authorizeActivities: boolean;
    };
  }