import { AuditableModelDto } from './AuditableModelDto';

export interface AuthorizedUserDto extends AuditableModelDto {
  id: number;
  FirstName: string;
  LastName: string;
  MobilePhone: string;
  EmailId: string;
  LoginId: string;
  Password: string;
  FailedLogins: number;
  LastPasswordChange: Date;
  LastFailed: Date;
  LastLogin: Date;
  IsActive: boolean;
}
