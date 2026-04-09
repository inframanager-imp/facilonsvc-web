import {
    UserPersonalInformationDto,
    UserPassportDetailsDto,
    UserResidentialStatusDto,
    UserTaxInfoDto,
    UserBankDetailsDto,
    UserContactDetailsDto,
    UserNominationDto,
    UserRiskProfileDto,
    InvestorExperienceDto
} from '../services/profile.service';

// Regex Patterns
export const NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'.-]{2,100}$/;
export const PHONE_DIGITS_REGEX = /^\d+$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Common Validation Helpers
const isEmpty = (value: any) => !value || (typeof value === 'string' && value.trim() === '');

const validateName = (value: string | undefined, label: string): string | null => {
    if (isEmpty(value)) return `${label} is required`;
    if (!NAME_REGEX.test(value!)) return `${label} contains invalid characters`;
    return null;
};

const validateDate = (value: string | undefined, label: string): string | null => {
    if (isEmpty(value)) return `${label} is required`;
    return null;
};

// Helper to add error
const addError = (errors: Record<string, string>, field: string, message: string) => {
    errors[field] = message;
};

export const validatePersonalInformation = (data: UserPersonalInformationDto): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Name
    let err = validateName(data.investorFirstName, 'First Name');
    if (err) addError(errors, 'investorFirstName', err);

    err = validateName(data.investorLastName, 'Last Name');
    if (err) addError(errors, 'investorLastName', err);

    // Date of Birth & Age Check
    if (isEmpty(data.userDob)) {
        addError(errors, 'userDob', 'Date of Birth is required');
    } else {
        const dob = new Date(data.userDob!);
        const ageDiffMs = Date.now() - dob.getTime();
        const ageDate = new Date(ageDiffMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (age < 18) addError(errors, 'userDob', 'You must be at least 18 years old');
    }

    if (isEmpty(data.gender)) addError(errors, 'gender', 'Gender is required');
    if (isEmpty(data.maritalStatus)) addError(errors, 'maritalStatus', 'Marital Status is required');
    if (isEmpty(data.cityOfDob)) addError(errors, 'cityOfDob', 'City of Birth is required');
    if (isEmpty(data.countryDob)) addError(errors, 'countryDob', 'Country of Birth is required');
    if (isEmpty(data.citizenship)) addError(errors, 'citizenship', 'Citizenship is required');
    if (isEmpty(data.countryOfResidence) || String(data.countryOfResidence).trim() === '-1') {
        addError(errors, 'countryOfResidence', 'Country of Residence is required');
    }

    // Parents
    err = validateName(data.fathersFirstName, "Father's First Name");
    if (err) addError(errors, 'fathersFirstName', err);

    err = validateName(data.fathersLastName, "Father's Last Name");
    if (err) addError(errors, 'fathersLastName', err);

    err = validateName(data.motherFirstName, "Mother's First Name");
    if (err) addError(errors, 'motherFirstName', err);

    err = validateName(data.motherLastName, "Mother's Last Name");
    if (err) addError(errors, 'motherLastName', err);

    // Address
    if (isEmpty(data.addressLine1)) addError(errors, 'addressLine1', 'Address Line 1 is required');
    if (isEmpty(data.userCity)) addError(errors, 'userCity', 'City is required');
    if (isEmpty(data.userState)) addError(errors, 'userState', 'State is required');
    if (isEmpty(data.userZipCode)) addError(errors, 'userZipCode', 'Zip Code is required');
    if (isEmpty(data.userCountry)) addError(errors, 'userCountry', 'Country is required');

    return errors;
};

export const validatePassportInformation = (data: UserPassportDetailsDto): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (isEmpty(data.passportNumber)) addError(errors, 'passportNumber', 'Passport Number is required');
    if (isEmpty(data.passportIssueDate)) addError(errors, 'passportIssueDate', 'Passport Issue Date is required');
    if (isEmpty(data.passportExpiryDate)) addError(errors, 'passportExpiryDate', 'Passport Expiry Date is required');
    if (isEmpty(data.passportPlaceOfIssue)) addError(errors, 'passportPlaceOfIssue', 'Place of Issue is required');
    if (isEmpty(data.passportCountryOfIssue)) addError(errors, 'passportCountryOfIssue', 'Country of Issue is required');
    if (isEmpty(data.passportNationality)) addError(errors, 'passportNationality', 'Nationality is required');

    // Date checks
    if (data.passportIssueDate && data.passportExpiryDate) {
        if (new Date(data.passportIssueDate) > new Date(data.passportExpiryDate)) {
            addError(errors, 'passportExpiryDate', 'Passport Expiry Date must be after Issue Date');
        }
    }

    return errors;
};

export const validateResidentialStatus = (data: UserResidentialStatusDto): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Check if OCI section is filled (NRI path)
    const hasOciData = !isEmpty(data.userOciCardNo) || !isEmpty(data.userOciIssueDate) || !isEmpty(data.userOciValidUpto);
    
    // Check if Type of Proof section is filled (Foreign National path)
    const hasTypeOfProofData = !isEmpty(data.userTypeOfProof) || !isEmpty(data.userVisaNumber) || !isEmpty(data.userVisaType);

    // Laravel logic: Either fill OCI (for NRI) OR Type of Proof (for Foreign National), not both
    if (hasOciData) {
        // NRI Investor - Validate OCI fields
        if (isEmpty(data.userOciCardNo)) addError(errors, 'userOciCardNo', 'OCI Card No is required');
        if (isEmpty(data.userOciIssueDate)) addError(errors, 'userOciIssueDate', 'OCI Issue Date is required');
    } else if (hasTypeOfProofData || data.userTypeOfProof) {
        // Foreign National - Validate Type of Proof fields
        if (isEmpty(data.userTypeOfProof)) {
            addError(errors, 'userTypeOfProof', 'Type of Proof is required');
        } else {
            // Validation for Visa proof type
            if (data.userTypeOfProof === 'Visa') {
                if (isEmpty(data.userVisaType)) addError(errors, 'userVisaType', 'Visa Type is required');
                if (isEmpty(data.userVisaNumber)) addError(errors, 'userVisaNumber', 'Visa Number is required');
                if (isEmpty(data.userVisaIssuerDate)) addError(errors, 'userVisaIssuerDate', 'Visa Issuer Date is required');
                if (isEmpty(data.userVisaExpiryDate)) addError(errors, 'userVisaExpiryDate', 'Visa Expiry Date is required');
            }

            // Validation for Resident Proof type
            if (data.userTypeOfProof === 'Resident Proof') {
                if (isEmpty(data.userVisaDateOfIssue)) addError(errors, 'userVisaDateOfIssue', 'Date of Issue is required');
            }
        }
    } else {
        // No data filled - require at least one section
        addError(errors, 'userOciCardNo', 'Please fill either OCI details (for NRI) or Type of Proof (for Foreign National)');
    }

    return errors;
};

const hasTaxResidencyCountryValue = (data: UserTaxInfoDto): boolean => {
    const id = data.taxResidencyCountryId;
    if (id !== null && id !== undefined && !Number.isNaN(Number(id))) {
        return true;
    }
    const raw = data.taxResidencyCountry;
    if (raw === null || raw === undefined) return false;
    if (typeof raw === 'number') return !Number.isNaN(raw);
    return String(raw).trim() !== '';
};

export const validateTaxInformation = (data: UserTaxInfoDto): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!hasTaxResidencyCountryValue(data)) {
        addError(errors, 'taxResidencyCountry', 'Tax Residency Country is required');
    }
    if (isEmpty(data.tinNumber)) addError(errors, 'tinNumber', 'Tax Identification Number (TIN) is required');
    if (isEmpty(data.taxIdentificationNumberType)) addError(errors, 'taxIdentificationNumberType', 'TIN Type is required');
    if (isEmpty(data.fatcaStatus)) addError(errors, 'fatcaStatus', 'FATCA Status is required');
    if (isEmpty(data.crsDeclaration)) addError(errors, 'crsDeclaration', 'CRS Declaration is required');

    return errors;
};

export const validateBankDetails = (data: UserBankDetailsDto): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (isEmpty(data.accountType)) addError(errors, 'accountType', 'Account Type is required');

    if (data.rbiApproval === 'yes') {
        if (isEmpty(data.rbiApprovalOrderNumber)) addError(errors, 'rbiApprovalOrderNumber', 'PIS Approval No is required');
        if (isEmpty(data.rbiApprovalDate)) addError(errors, 'rbiApprovalDate', 'PIS Approval Date is required');
        if (isEmpty(data.beneficiaryName)) addError(errors, 'beneficiaryName', 'Beneficiary Name is required for PIS Approval');
    } else {
        // If not PIS, Beneficiary Name is just the normal account holder name.
        if (isEmpty(data.beneficiaryName)) addError(errors, 'beneficiaryName', "Account Holder's Name is required");
    }

    if (isEmpty(data.bankName)) addError(errors, 'bankName', 'Bank Name is required');
    if (isEmpty(data.bankAccountNumber)) addError(errors, 'bankAccountNumber', 'Account Number is required');
    if (isEmpty(data.bankIfscCode)) addError(errors, 'bankIfscCode', 'IFSC Code is required');
    if (isEmpty(data.branchName)) addError(errors, 'branchName', 'Branch Name is required');

    return errors;
};

export const validateContactDetails = (data: UserContactDetailsDto): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (isEmpty(data.proofOfAddress)) addError(errors, 'proofOfAddress', 'Proof of Address is required');
    if (isEmpty(data.addressLine1)) addError(errors, 'addressLine1', 'Address Line 1 is required');
    if (isEmpty(data.userCountry)) addError(errors, 'userCountry', 'Country is required');
    if (isEmpty(data.userCity)) addError(errors, 'userCity', 'City is required');
    if (isEmpty(data.userState)) addError(errors, 'userState', 'State is required');
    if (isEmpty(data.userZipCode)) addError(errors, 'userZipCode', 'Zip Code is required');

    if (isEmpty(data.primaryPhone)) addError(errors, 'primaryPhone', 'Primary Phone is required');
    if (isEmpty(data.email)) {
        addError(errors, 'email', 'Email is required');
    } else if (!EMAIL_REGEX.test(data.email!)) {
        addError(errors, 'email', 'Invalid Email format');
    }


    // Correspondence Address Check
    const sameAsPerm = data.corrAddressSameAsPerm === 'true' || data.corrAddressSameAsPerm === '1';
    if (!sameAsPerm) {
        if (isEmpty(data.addressType)) addError(errors, 'addressType', 'Address Type is required for correspondence address');
        if (isEmpty(data.corrAddressLine1)) addError(errors, 'corrAddressLine1', 'Correspondence Address Line 1 is required');
        if (isEmpty(data.corrUserCountry)) addError(errors, 'corrUserCountry', 'Correspondence Country is required');
        if (isEmpty(data.corrUserCity)) addError(errors, 'corrUserCity', 'Correspondence City is required');
        if (isEmpty(data.corrUserState)) addError(errors, 'corrUserState', 'Correspondence State is required');
        if (isEmpty(data.corrUserZipCode)) addError(errors, 'corrUserZipCode', 'Correspondence Zip Code is required');
    }

    return errors;
};

export const validateNominationDetails = (data: UserNominationDto): Record<string, string> => {
    const errors: Record<string, string> = {};
    const appointNominee = data.appointNominee === true || data.appointNominee === 'yes';

    if (!appointNominee) return errors; // No validation when not appointing nominee

    // At least one nominee required
    if (isEmpty(data.nomineeName1)) {
        addError(errors, 'nomineeName1', 'Name of the Nominee is required');
    } else {
        if (isEmpty(data.nomineeRelation1)) addError(errors, 'nomineeRelation1', 'Nominee 1 Relationship is required');
        if (isEmpty(data.nomineeDob1)) addError(errors, 'nomineeDob1', 'Nominee 1 Date of Birth is required');
        if (data.nomineeShare1 === undefined || data.nomineeShare1 === null) addError(errors, 'nomineeShare1', 'Nominee 1 Share % is required');
        if (data.isMinor) {
            if (isEmpty(data.guardianName1)) addError(errors, 'guardianName1', 'Guardian name is required when nominee is a minor');
            if (isEmpty(data.guardianRelationship)) addError(errors, 'guardianRelationship', 'Guardian relationship is required when nominee is a minor');
        }
    }

    if (!isEmpty(data.nomineeName2)) {
        if (isEmpty(data.nomineeRelation2)) addError(errors, 'nomineeRelation2', 'Nominee 2 Relationship is required');
        if (isEmpty(data.nomineeDob2)) addError(errors, 'nomineeDob2', 'Nominee 2 Date of Birth is required');
        if (data.nomineeShare2 === undefined || data.nomineeShare2 === null) addError(errors, 'nomineeShare2', 'Nominee 2 Share % is required');
    }

    if (!isEmpty(data.nomineeName3)) {
        if (isEmpty(data.nomineeRelation3)) addError(errors, 'nomineeRelation3', 'Nominee 3 Relationship is required');
        if (isEmpty(data.nomineeDob3)) addError(errors, 'nomineeDob3', 'Nominee 3 Date of Birth is required');
        if (data.nomineeShare3 === undefined || data.nomineeShare3 === null) addError(errors, 'nomineeShare3', 'Nominee 3 Share % is required');
    }

    // Sum allocation % only for nominees that are filled — must total 100%
    let totalShare = 0;
    if (!isEmpty(data.nomineeName1)) totalShare += Number(data.nomineeShare1) || 0;
    if (!isEmpty(data.nomineeName2)) totalShare += Number(data.nomineeShare2) || 0;
    if (!isEmpty(data.nomineeName3)) totalShare += Number(data.nomineeShare3) || 0;
    if (!isEmpty(data.nomineeName1) && totalShare !== 100) {
        addError(errors, 'totalShare', `Total Nominee Share must be 100% (Current: ${totalShare}%)`);
    }

    return errors;
};

export const validateRiskProfile = (data: UserRiskProfileDto | InvestorExperienceDto): Record<string, string> => {
    const errors: Record<string, string> = {};
    const d = data as any;

    if (isEmpty(data.occupation)) addError(errors, 'occupation', 'Occupation is required');
    if (isEmpty(data.grossIncome) && isEmpty(d.annualIncome)) addError(errors, 'grossIncome', 'Gross Income is required');
    if (isEmpty(data.netWorth)) addError(errors, 'netWorth', 'Net Worth is required');
    if (isEmpty(data.educationalQualification) && isEmpty(d.qualification)) addError(errors, 'educationalQualification', 'Educational Qualification is required');
    if (isEmpty(data.sourceOfFunds)) addError(errors, 'sourceOfFunds', 'Source of Funds is required');

    const expIn = data.investmentExperienceIn;
    if (!expIn || expIn.length === 0) addError(errors, 'investmentExperienceIn', 'Please select at least one Investment Experience category');

    if (isEmpty(d.investmentExperienceYears) && isEmpty(d.yearsOfInvestmentExperience)) {
        addError(errors, 'investmentExperienceYears', 'No of Years of Investment Experience is required');
    }

    if (d.polExposed === undefined || d.polExposed === null) addError(errors, 'polExposed', 'Please indicate if you are a politically exposed person');
    if (d.polExposedRelated === undefined || d.polExposedRelated === null) addError(errors, 'polExposedRelated', 'Please indicate if you are related to a politically exposed person');
    if (d.activity === undefined || d.activity === null) addError(errors, 'activity', 'Please indicate if you are involved in regulated activities');
    if (d.moneyChangeService === undefined || d.moneyChangeService === null) addError(errors, 'moneyChangeService', 'Foreign Exchange / Money Changer Services is required');
    if (d.gamblingService === undefined || d.gamblingService === null) addError(errors, 'gamblingService', 'Gaming / Gambling / Lottery Services is required');
    if (d.pawningService === undefined || d.pawningService === null) addError(errors, 'pawningService', 'Money Lending / Pawning Services is required');
    if (d.instanceViolation === undefined || d.instanceViolation === null) addError(errors, 'instanceViolation', 'Instance of violation question is required');

    return errors;
};
