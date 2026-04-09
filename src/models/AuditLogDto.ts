export interface AuditLogDto {
  id: number;
  serviceAgentId: number;
  serviceAgentName?: string;
  investorId: number;
  actionType: string;
  actionCategory: string;
  entityType?: string;
  entityId?: string;
  endpoint?: string;
  httpMethod?: string;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
