export const JOB_OPTIONS = [
  'DEVELOPMENT',
  'DESIGN', 
  'MARKETING',
  'HUMAN_RESOURCES',
  'SALES'
] as const;

export type JobType = typeof JOB_OPTIONS[number];

export interface CreatePrestataireRequest {
  first_name: string;
  name: string;
  job: JobType;
  description: string;
  experience_time: number;
  study_level: number;
  city: string;
  tjm: number;
  skills: { description: string }[];
  diplomas: { description: string }[];
  experiences: { description: string }[];
  languages: { description: string }[];
}

export interface Prestataire {
  id: number;
  firstName: string;
  name: string;
  job: JobType;
  description: string;
  experienceTime: number;
  studyLevel: number;
  city: string;
  tjm: string;
  userId: number;
}

export interface CreatePrestataireResponse {
  success: boolean;
  data?: {
    id: number;
    token: string;
  };
  message: string;
}

// Types pour l'extraction AI
export interface AIExtractRequest {
  prompt: string;
}

export interface AIExtractResponse {
  success: boolean;
  data?: {
    first_name: string;
    name: string;
    job: string;
    description: string;
    experience_time: number;
    study_level: string;
    city: string;
    tjm: number;
    skills: { description: string }[];
    diplomas: { description: string }[];
    experiences: { description: string }[];
    languages: { description: string }[];
    confidence_score: number;
    extraction_notes: string;
  };
  message?: string;
  error?: string;
} 