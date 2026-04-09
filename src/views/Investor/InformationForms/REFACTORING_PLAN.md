# Investor Profile Refactoring Plan

## Overview
Refactoring `InvestorProfile.tsx` (3,117 lines) into modular, maintainable components.

## Completed
- ✅ Created `src/utils/formHelpers.ts` - Shared utility functions
- ✅ Created `src/hooks/useFormSection.ts` - Custom hook for form state management
- ✅ Created `InformationForms/shared/constants.ts` - Shared dropdown options
- ✅ Created `InformationForms/shared/types.ts` - TypeScript interfaces
- ✅ Created directory structure for all components

## Component Breakdown

### 1. Container Component
**File**: `InformationForms/InformationContainer.tsx`
- Tab navigation
- Progress tracking
- Shared context provider
- Route all form sections

### 2. Personal Information Form
**File**: `InformationForms/PersonalInformation/PersonalInformationForm.tsx`
- Basic personal details (name, DOB, gender, etc.)
- Father/mother/spouse information
- Citizenship and nationality
- ~300-400 lines

### 3. Bank Details Form
**File**: `InformationForms/BankDetails/BankDetailsForm.tsx`
- Primary bank account
- Settlement account type
- IFSC/SWIFT codes
- RBI approval details
- ~250-300 lines

### 4. Tax Information Form
**File**: `InformationForms/TaxInformation/TaxInformationForm.tsx`
- Tax residency country
- PAN/TIN number
- US person status
- FATCA/CRS information
- ~200-250 lines

### 5. Contact Details Form
**File**: `InformationForms/ContactDetails/ContactDetailsForm.tsx`
- Primary/secondary phone
- WhatsApp number
- Email addresses
- Preferred contact method
- ~200-250 lines

### 6. Nomination Form
**File**: `InformationForms/Nomination/NominationForm.tsx`
- Up to 3 nominees
- Share allocation logic
- Relationship and document details
- ~400-500 lines
- Includes `NomineeCard.tsx` sub-component

### 7. Passport Details Form
**File**: `InformationForms/PassportDetails/PassportDetailsForm.tsx`
- Passport number, issue/expiry dates
- Place of issue
- ~200-250 lines

### 8. Residential Status Form
**File**: `InformationForms/ResidentialStatus/ResidentialStatusForm.tsx`
- Residential address
- Correspondence address
- Proof of address
- ~200-250 lines

### 9. Risk Profile / Other Information Form
**File**: `InformationForms/RiskProfile/RiskProfileForm.tsx`
- Investment experience
- Source of funds
- Occupation, education
- Annual income, net worth
- Trading experience
- ~300-400 lines

### 10. Final Submission Form
**File**: `InformationForms/FinalSubmission/FinalSubmissionForm.tsx`
- Consent checkboxes
- Final declaration
- PDF download options
- ~150-200 lines

## State Management Strategy

### Original (Monolithic)
- All state in one component
- 9 form state objects
- 9 save handlers
- Complex interdependencies

### Refactored (Modular)
- Each component manages its own state
- Uses `useFormSection` hook
- Shared context for common data
- Independent save operations
- Parent container coordinates progress

## API Integration

### Services Used
- `profileService` - CRUD operations for all sections
- `investorService` - Dashboard data
- `contentService` - Master data (countries, ISD codes)
- `pdfService` - Document generation

### Save Operations
Each form section has its own save endpoint:
- `profileService.updatePersonalInfo()`
- `profileService.updateBankDetails()`
- `profileService.updateTaxInfo()`
- `profileService.updateContactDetails()`
- `profileService.updateNomination()`
- `profileService.updatePassport()`
- `profileService.updateResidentialStatus()`
- `profileService.updateExperience()`
- `profileService.updateRiskProfile()`
- `profileService.finalSubmit()`

## Validation Strategy

### Original
- All validation functions in one file
- Mixed with component logic

### Refactored
- Validation functions remain in `src/utils/investorValidation.ts`
- Each component imports only what it needs
- Validation happens in `useFormSection` hook

## Navigation & Routing

### Current Route
- `/investor/profile` - Shows entire monolithic component

### Proposed Routes (Future Enhancement)
- `/investor/information` - Container with all sections
- Individual routes possible for deep linking:
  - `/investor/information/personal`
  - `/investor/information/bank`
  - etc.

## Migration Path

### Phase 1: Core Infrastructure (DONE)
- Shared utilities
- Custom hooks
- Type definitions
- Directory structure

### Phase 2: Extract Components (IN PROGRESS)
- Create each form component
- Test individually
- Ensure all logic preserved

### Phase 3: Integration
- Create container component
- Wire up all sections
- Test full flow

### Phase 4: Cleanup
- Update imports throughout app
- Remove old InvestorProfile.tsx
- Update documentation

## Testing Checklist

For each component:
- [ ] Form fields render correctly
- [ ] Validation works
- [ ] Save operation succeeds
- [ ] Error handling works
- [ ] Permission checks enforced
- [ ] Loading states displayed
- [ ] Navigation works
- [ ] Progress tracking updates

## Benefits

### Code Quality
- Each file < 500 lines
- Single Responsibility Principle
- Easy to understand and modify
- Better code organization

### Developer Experience
- Faster navigation
- Easier debugging
- Clear component boundaries
- Better TypeScript support

### Maintainability
- Independent testing
- Isolated bug fixes
- Easier feature additions
- Better code reviews

### Performance
- Potential for code splitting
- Lazy loading sections
- Reduced initial bundle size

## Next Steps

1. Create `InformationContainer.tsx`
2. Extract PersonalInformationForm (highest priority - first step)
3. Extract remaining forms in order of user flow
4. Test integration
5. Update routes
6. Deploy and monitor
