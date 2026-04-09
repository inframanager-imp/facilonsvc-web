export type DelegationScope = 'CKYC_ONLY' | 'ONBOARDING_ONLY' | 'FULL_ONBOARDING' | 'VIEW_ONLY';

export interface DelegationDto {
  id: number;
  investorId: number;
  serviceAgentId: number;
  serviceAgentName: string;
  serviceAgentCode: string;
  serviceAgentEmail: string;
  scope: DelegationScope;
  canViewProfile: boolean;
  canEditKyc: boolean;
  canUploadDocuments: boolean;
  canSubmitForms: boolean;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  status?: string;
  assignedBySpId?: number;
  consentVersion?: string;
  /** Optional notes from Service Provider (SP assignment) */
  notes?: string;
  createdAt: string;
}

export interface DelegationCreateDto {
  serviceAgentCode: string;
  scope: DelegationScope;
  canViewProfile: boolean;
  canEditKyc: boolean;
  canUploadDocuments: boolean;
  canSubmitForms: boolean;
  validFrom?: string;
  validTo?: string;
  consentVersion: string;
}
