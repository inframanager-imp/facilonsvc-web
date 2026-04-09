export interface ServiceAgentDto {
  id: number;
  agentCode: string;
  agentType: string;
  fullName: string;
  email: string;
  mobile: string;
  photoUrl?: string;
  assignedRegion?: string;
  assignedSegment?: string;
  isActive: boolean;
  onboardingStatus: string;
}

export interface ServiceAgentInvestorDto {
  investorId: number;
  investorName: string;
  investorEmail: string;
  investorUniqueCode: string;
  uniqueCode?: string;
  verifyStatus?: number;
  delegationId: number;
  delegationScope: string;
  delegationActive: boolean;
  scope?: string;
  canViewProfile: boolean;
  canEditKyc: boolean;
  canUploadDocuments: boolean;
  canSubmitForms: boolean;
  validFrom?: string;
  validTo?: string;
}
