export interface UpdatePrestataireDto {
    first_name?: string;
    name?: string;
    job?: string;
    description?: string;
    experience_time?: number;
    study_level?: string;
    city?: string;
    tjm?: number;
    skills?: { description: string }[];
    diplomas?: { description: string }[];
    experiences?: { description: string }[];
    languages?: { description: string }[];
}
