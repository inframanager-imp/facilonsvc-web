import { apiClient } from './api.client';

export interface DsrCaseEventDto {
  eventCode: string;
  title: string;
  note?: string;
  actor?: string;
  actorRole?: string;
  fromStatus?: string;
  toStatus?: string;
  investorVisible: boolean;
  createdAt?: string;
}

export interface DsrAdminCaseDto {
  caseId: string;
  investorUniqueCode: string;
  requestType: string;
  jurisdiction: string;
  dataArea?: string;
  spRelationFlag?: string;
  requestDescription: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  requesterRole?: string;
  status: string;
  investorStatus: string;
  actionRequired: boolean;
  slaOverdue: boolean;
  assignedTo?: string;
  verificationStatus?: string;
  verificationMethod?: string;
  decision?: string;
  finalOutcome?: string;
  resolutionNotes?: string;
  hasSupportingFile: boolean;
  evidenceFolderPath?: string;
  submittedAt?: string;
  slaDeadline?: string;
  resolvedAt?: string;
  updatedAt?: string;
  timeline?: DsrCaseEventDto[];
}

export interface DsrDashboardSummaryDto {
  total: number;
  open: number;
  overdue: number;
  newToday: number;
  notWorked: number;
  withinTat: number;
  awaitingVerification: number;
  closedThisMonth: number;
  byRequestType: Record<string, number>;
  byStatus: Record<string, number>;
}

/** Mutually exclusive triage buckets: overdue + newToday + notWorked + withinTat = open. */
export type DsrTriageBucket = 'OVERDUE' | 'NEW_TODAY' | 'NOT_WORKED' | 'WITHIN_TAT';

export interface DsrAdminUserDto {
  id: number;
  firstName: string;
  lastName: string;
  emailId: string;
  mobilePhone?: string;
  loginId: string;
  active: boolean;
  roles: string[];
  lastLogin?: string;
}

export interface DsrAdminRegisterRequest {
  firstName: string;
  lastName: string;
  emailId: string;
  mobilePhone?: string;
  loginId: string;
  active?: boolean;
}

export interface DsrEvidenceFileDto {
  folder: string;
  name: string;
  relativePath: string;
  sizeBytes: number;
  lastModified?: string;
}

export interface DsrAdminUpdateRequest {
  status?: string;
  assignedTo?: string;
  verificationStatus?: string;
  verificationMethod?: string;
  decision?: string;
  finalOutcome?: string;
  resolutionNotes?: string;
  note?: string;
  internalOnly?: boolean;
}

export interface DsrListFilters {
  status?: string;
  requestType?: string;
  jurisdiction?: string;
  overdueOnly?: boolean;
  assignedTo?: string;
  bucket?: DsrTriageBucket;
}

export interface DsrCasePageDto {
  content: DsrAdminCaseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

class AdminDsrService {
  private baseUrl = '/api/admin/dsr';

  async getDashboard(): Promise<DsrDashboardSummaryDto> {
    const response = await apiClient.get<DsrDashboardSummaryDto>(`${this.baseUrl}/dashboard`);
    return response.data;
  }

  async listCases(filters: DsrListFilters = {}): Promise<DsrAdminCaseDto[]> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.requestType) params.append('requestType', filters.requestType);
    if (filters.jurisdiction) params.append('jurisdiction', filters.jurisdiction);
    if (filters.overdueOnly) params.append('overdueOnly', 'true');
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.bucket) params.append('bucket', filters.bucket);
    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
    const response = await apiClient.get<DsrAdminCaseDto[]>(url);
    return response.data;
  }

  async listCasesPaged(
    filters: DsrListFilters = {},
    page = 0,
    size = 10
  ): Promise<DsrCasePageDto> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.requestType) params.append('requestType', filters.requestType);
    if (filters.jurisdiction) params.append('jurisdiction', filters.jurisdiction);
    if (filters.overdueOnly) params.append('overdueOnly', 'true');
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.bucket) params.append('bucket', filters.bucket);
    params.append('page', String(page));
    params.append('size', String(size));
    const response = await apiClient.get<DsrCasePageDto>(`${this.baseUrl}/paged?${params.toString()}`);
    return response.data;
  }

  async getCase(caseId: string): Promise<DsrAdminCaseDto> {
    const response = await apiClient.get<DsrAdminCaseDto>(`${this.baseUrl}/${caseId}`);
    return response.data;
  }

  async updateCase(caseId: string, payload: DsrAdminUpdateRequest): Promise<DsrAdminCaseDto> {
    const response = await apiClient.put<DsrAdminCaseDto>(`${this.baseUrl}/${caseId}`, payload);
    return response.data;
  }

  async attachFile(caseId: string, file: File, subFolder?: string): Promise<DsrAdminCaseDto> {
    const formData = new FormData();
    formData.append('file', file);
    const params = subFolder ? `?subFolder=${encodeURIComponent(subFolder)}` : '';
    const response = await apiClient.post<DsrAdminCaseDto>(
      `${this.baseUrl}/${caseId}/files${params}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  async downloadSupportingFile(caseId: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${this.baseUrl}/${caseId}/supporting-file`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async listEvidence(caseId: string): Promise<DsrEvidenceFileDto[]> {
    const response = await apiClient.get<DsrEvidenceFileDto[]>(`${this.baseUrl}/${caseId}/evidence`);
    return response.data;
  }

  async downloadEvidence(caseId: string, relativePath: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `${this.baseUrl}/${caseId}/evidence/download?path=${encodeURIComponent(relativePath)}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async getStatuses(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.baseUrl}/reference/statuses`);
    return response.data;
  }

  // ----- DSR Admin user registration -----

  async getMyAdminProfile(): Promise<DsrAdminUserDto> {
    const response = await apiClient.get<DsrAdminUserDto>(`${this.baseUrl}/admins/me`);
    return response.data;
  }

  async listDsrAdmins(): Promise<DsrAdminUserDto[]> {
    const response = await apiClient.get<DsrAdminUserDto[]>(`${this.baseUrl}/admins`);
    return response.data;
  }

  async registerDsrAdmin(payload: DsrAdminRegisterRequest): Promise<DsrAdminUserDto> {
    const response = await apiClient.post<DsrAdminUserDto>(`${this.baseUrl}/admins`, payload);
    return response.data;
  }

  async deactivateDsrAdmin(userId: number): Promise<DsrAdminUserDto> {
    const response = await apiClient.delete<DsrAdminUserDto>(`${this.baseUrl}/admins/${userId}`);
    return response.data;
  }
}

export const adminDsrService = new AdminDsrService();
