/**
 * Shared types and interfaces for investor information forms
 */

import { MasterCountryDto, IsdCodeValuesDto } from '../../../../services/content.service';
import { InvestorDashboardDto } from '../../../../services/investor.service';

/** Common props for all form section components */
export interface FormSectionProps {
  onComplete?: () => void;
  onSave?: () => void;
  canEdit?: boolean;
  canSubmit?: boolean;
  isProxyMode?: boolean;
}

/** Tab type for navigation */
export type TabType = 
  | 'personal' 
  | 'bank' 
  | 'passport' 
  | 'residential' 
  | 'tax' 
  | 'contact' 
  | 'nomination' 
  | 'other' 
  | 'finalSubmit';

/** Progress tracking for each section */
export interface SectionProgress {
  completed: boolean;
  modified: boolean;
}

export interface ProgressState {
  personal: SectionProgress;
  bank: SectionProgress;
  passport: SectionProgress;
  residential: SectionProgress;
  tax: SectionProgress;
  contact: SectionProgress;
  nomination: SectionProgress;
  other: SectionProgress;
  finalSubmit: SectionProgress;
}

/** Shared context data passed to all form sections */
export interface SharedFormContext {
  taxResidencyCountries: MasterCountryDto[];
  isdCodes: IsdCodeValuesDto[];
  dashboardData: InvestorDashboardDto | null;
  reloadData: () => Promise<void>;
}
