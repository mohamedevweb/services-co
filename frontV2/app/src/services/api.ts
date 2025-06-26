import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import type { CreateOrganizationRequest, CreateOrganizationResponse } from '../types/organization';
import type { CreatePrestataireRequest, CreatePrestataireResponse, AIExtractRequest, AIExtractResponse } from '../types/prestataire';
import type { CreateProjectAIRequest, CreateProjectAIResponse, GetProjectsResponse, ProjectDetailResponse } from '../types/project';
import { extractTextFromPDF } from '../utils/pdfUtils';

class ApiService {
  private api: AxiosInstance;
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // URL de votre backend

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter automatiquement le token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Intercepteur pour gérer les erreurs de token
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de l\'inscription'
      };
    }
  }

  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/verify', { token });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token invalide'
      };
    }
  }

  async createOrganization(data: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
    try {
      const response: AxiosResponse<CreateOrganizationResponse> = await this.api.post('/organization', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Erreur lors de la création de l\'organisation'
      };
    }
  }

  async createPrestataire(data: CreatePrestataireRequest): Promise<CreatePrestataireResponse> {
    try {
      const response: AxiosResponse<CreatePrestataireResponse> = await this.api.post('/prestataire', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création du profil prestataire'
      };
    }
  }

  async extractPrestataireData(prompt: string): Promise<AIExtractResponse> {
    try {
      const response: AxiosResponse<AIExtractResponse> = await this.api.post('/ai/presta', { prompt });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'extraction des données'
      };
    }
  }

  async createProjectWithAI(data: CreateProjectAIRequest): Promise<CreateProjectAIResponse> {
    try {
      const response: AxiosResponse<CreateProjectAIResponse> = await this.api.post('/project-ai/create', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la création du projet'
      };
    }
  }

  async getProjectsByOrganization(organizationId: number): Promise<GetProjectsResponse> {
    try {
      const response: AxiosResponse<GetProjectsResponse> = await this.api.get(`/project/organization/${organizationId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des projets'
      };
    }
  }

  async getProjectDetails(projectId: number): Promise<ProjectDetailResponse> {
    try {
      const response: AxiosResponse<ProjectDetailResponse> = await this.api.get(`/project/${projectId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la récupération des détails du projet'
      };
    }
  }

  async updatePathChoice(pathId: number, isChoose: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.api.patch(`/project/path/${pathId}/choose`, { isChoose });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la mise à jour du path'
      };
    }
  }

  async updateTaskApproval(pathId: number, prestataireId: number, isApproved: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.api.patch(`/project/path/${pathId}/prestataire/${prestataireId}/approve`, { isApproved });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de l\'approbation de la tâche'
      };
    }
  }

  async extractProjectData(prompt: string, pdfs: File[] = []): Promise<string> {
    let combinedPrompt = prompt;

    // Extraire le texte des PDFs si présents
    if (pdfs.length > 0) {
      const pdfTexts = await Promise.all(pdfs.map(pdf => extractTextFromPDF(pdf)));
      const allPdfText = pdfTexts.join('\n\n');
      combinedPrompt = prompt ? `${prompt}\n\n${allPdfText}` : allPdfText;
    }

    return combinedPrompt;
  }

  // Méthode pour faire des requêtes authentifiées
  getApi(): AxiosInstance {
    return this.api;
  }

  // Méthodes pour gérer l'authentification
  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }
}

export const apiService = new ApiService(); 