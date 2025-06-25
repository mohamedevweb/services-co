export class CreateOrganizationDto {
    name!: string;
    adresse!: string;
    solde!: number;
    tel!: string;
}

export class UpdateOrganizationDto {
    name?: string;
    adresse?: string;
    solde?: number;
    tel?: string;
}

export class OrganizationResponseDto {
    id!: number;
    name!: string;
    adresse!: string;
    solde!: number;
    tel!: string;
    userId!: number;
} 