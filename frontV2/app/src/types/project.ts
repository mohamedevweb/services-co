export interface Project {
  id: number;
  title: string;
  description: string;
  organizationId: number;
}

export interface ProjectWithDetails extends Project {
  organization: {
    id: number;
    name: string;
    adresse: string;
    tel: string;
  };
  paths: ProjectPath[];
}

export interface ProjectPath {
  id: number;
  number: number;
  isChoose: boolean;
  projectId: number;
  tasks: ProjectTask[];
}

export interface ProjectTask {
  prestataireId: number;
  pathId: number;
  isApproved: boolean;
  nbDays: number;
  name: string;
}

export interface Prestataire {
  id: number;
  firstName: string;
  name: string;
  job: string;
  description: string;
  experienceTime: number;
  city: string;
  tjm: string;
}

export interface ProjectTaskWithPrestataire extends ProjectTask {
  prestataire: Prestataire;
}

export interface ProjectPathWithDetails extends Omit<ProjectPath, 'tasks'> {
  tasks: ProjectTaskWithPrestataire[];
}

export interface ProjectDetailResponse {
  success: boolean;
  data?: {
    project: {
      id: number;
      title: string;
      description: string;
      organizationId: number;
    };
    organization: {
      id: number;
      name: string;
      adresse: string;
      tel: string;
    };
    paths: ProjectPathWithDetails[];
  };
  error?: string;
}

export interface CreateProjectAIRequest {
  prompt: string;
  organizationId: number;
}

export interface CreateProjectAIResponse {
  success: boolean;
  message?: string;
  data?: {
    projectId: number;
    paths: {
      pathId: number;
      number: number;
      tasks: {
        prestataireId: number;
        name: string;
        nbDays: number;
      }[];
    }[];
  };
  error?: string;
}

export interface GetProjectsResponse {
  success: boolean;
  data?: Project[];
  error?: string;
} 