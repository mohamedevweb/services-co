export interface CreateOrganizationRequest {
  name: string;
  adresse: string;
  tel: string;
  solde?: number;
}

export interface Organization {
  id: number;
  name: string;
  adresse: string;
  solde: number;
  tel: string;
  userId: number;
}

export interface CreateOrganizationResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    token: string;
  };
} 