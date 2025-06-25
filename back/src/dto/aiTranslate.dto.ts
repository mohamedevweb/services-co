export class CreateAITranslateDto {
    content!: string; // stringified JSON
    targetLanguage!: string;
    organizationId!: number;
}

export class AITranslateResponseDto {
    id!: number;
    content!: string; // original stringified JSON
    contentTranslate!: string; // translated stringified JSON
    organizationId!: number;
}

// Types pour parser le JSON de contenu
export interface TextBlock {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontName: string;
}

export interface Page {
    pageNumber: number;
    width: number;
    height: number;
    textBlocks: TextBlock[];
}

export interface DocumentContent {
    pages: Page[];
} 