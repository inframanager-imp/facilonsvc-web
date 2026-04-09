import { AuditableModelDto } from './AuditableModelDto';

export interface RoleListDto extends AuditableModelDto {
  roleListId: number;
  label: string;
  sequenceNo: number;
  parentListId?: number;
  isActive: boolean;
  tenantId?: number;
}
