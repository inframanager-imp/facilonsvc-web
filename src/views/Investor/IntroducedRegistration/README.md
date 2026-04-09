# Introduced Investor Registration Flow

This directory contains the **complete implementation** of the Introduced Investor Registration Flow, achieving **Laravel UI/UX parity** with the existing Laravel Blade templates.

## Overview

This flow is specifically for investors who are **introduced by a broker or service provider** (distinct from self-registration). The implementation replicates the entire sequence from the Laravel application, including:

- Dataverse data fetching
- Data consent management
- Multi-step registration (personal details, OTP verification, final details)
- **B2C account creation** with default password `Invest@1234`
- Credentials email delivery

## Architecture

### Backend (Spring Boot API)
Located in: `Facilon-platform-API/src/main/java/com/facilon/app/module/client/`

**Key Components:**
- **Database**: New table `introduced_registration_sessions` (Flyway migration: `V1.30__create_introduced_registration_sessions.sql`)
- **Entity**: `IntroducedRegistrationSession.java` - JPA entity for session tracking
- **Repository**: `IntroducedRegistrationSessionRepository.java` - Data access layer
- **Service**: `IntroducedInvestorRegistrationService.java` - Complete business logic
- **Controller**: `IntroducedInvestorController.java` - REST API endpoints
- **DTOs**: Request/response objects in `dto/introduced/` directory
- **B2C Integration**: `createB2CAccount()` method in service, using `UserMgmtApiClient`

### Frontend (React Web)
Located in: `Facilon-platform-Web/src/views/Investor/IntroducedRegistration/`

**Components:**
1. `IntroducedInvestorStart.tsx` - Initial landing page (Laravel: `introduce-multiple-register-main-step.blade.php`)
2. `IntroducedInvestorConsent.tsx` - Data consent page (Laravel: `data-consent-management.blade.php`)
3. `IntroducedInvestorStep1.tsx` - Personal details form (Laravel: `introduce-register-step1.blade.php`)
4. `IntroducedInvestorStep2.tsx` - OTP verification (Laravel: `introduce-register-step2.blade.php`)
5. `IntroducedInvestorStep4.tsx` - Final details with conditional fields (Laravel: `introduce-register-step4.blade.php`)
6. `IntroducedInvestorSuccess.tsx` - Registration completion page
7. `IntroducedInvestorRegistration.scss` - All styling (exact Laravel clone)

**Services:**
- `src/services/introducedInvestorService.ts` - API integration

**Routes:**
- `/investor/introduced/start/:investorId`
- `/investor/introduced/consent/:investorId`
- `/investor/introduced/step1/:uniqueCode`
- `/investor/introduced/step2/:uniqueCode`
- `/investor/introduced/step4/:uniqueCode`
- `/investor/introduced/success`

## Flow Sequence

```
1. Investor clicks unique link with Dataverse Investor ID
   ↓
2. IntroducedInvestorStart - Display investor details from Dataverse
   ↓
3. IntroducedInvestorConsent - Data consent management (2 checkboxes required)
   ↓
4. IntroducedInvestorStep1 - Personal details form + OTP request
   ↓
5. IntroducedInvestorStep2 - OTP verification (4-digit, 10-minute timer)
   ↓
6. IntroducedInvestorStep4 - Nationality-specific fields (Indian/Other, PAN, OCI)
   ↓
7. Backend: Complete registration + B2C account creation + Send credentials email
   ↓
8. IntroducedInvestorSuccess - Show success message with login link
```

## API Endpoints

All endpoints are prefixed with `/api/investor/introduced`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/initiate?dataverseInvestorId={id}` | Fetch investor details from Dataverse |
| POST | `/consent?dataverseInvestorId={id}` | Record data consent |
| POST | `/step1` | Submit personal details & send OTP |
| POST | `/verify-otp` | Verify email OTP |
| POST | `/complete` | Complete registration & create B2C account |
| POST | `/resend-otp?uniqueCode={code}` | Resend OTP |

## UI/UX Cloning Details

### Design Elements (Exact Laravel Match)
- **Background**: `2125.jpg` image from Laravel public directory
- **Colors**: Primary red `#BE1717`, success green `#28a745`
- **Fonts**: Same font sizes, weights, and spacing
- **Form Elements**: 
  - Custom checkboxes with SVG checkmarks
  - Radio buttons with custom styling
  - Input fields with focus states
  - Dropdown selects with custom arrows
- **Buttons**: Rounded pill-style buttons with hover effects
- **OTP Inputs**: 4 separate boxes with focus flow
- **Timer**: Countdown display with resend functionality
- **Modals**: Privacy policy and terms modal (can be enhanced)

### Conditional Logic (Step 4)
- **Self vs Legal Entity**: Toggle between individual and company fields
- **Indian Nationality**: Shows PAN card question + country of residence
- **Other Nationality**: Shows country of residence + Indian origin question
- **Indian Origin (Yes)**: Shows OCI card question
- **WhatsApp Agreement**: Shows WhatsApp number collection (same/different)

## B2C Account Creation

**Location**: `IntroducedInvestorRegistrationService.createB2CAccount()`

**Process**:
1. Retrieve `TenantB2CConfig` for the tenant
2. Build `SignUpDto` with:
   - Email from `AuthorizedUser`
   - Password: `Invest@1234` (hardcoded default)
   - First name, last name, display name
   - Mobile phone
   - B2C client credentials
   - Issuer: `facilonservices.onmicrosoft.com`
3. Call `userMgmtClient.createUserLatest(signUpDto)`
4. Update `AuthorizedUser` with `azureAdUserId`
5. Return success/failure

**Email Notification**: `sendCredentialsEmail()` sends email with username and default password.

## Testing the Flow

### 1. Start Registration
```
GET http://localhost:8080/api/investor/introduced/initiate?dataverseInvestorId=SS-INV-12345
```

### 2. Record Consent
```
POST http://localhost:8080/api/investor/introduced/consent?dataverseInvestorId=SS-INV-12345
```
Response contains `uniqueCode` for subsequent steps.

### 3. Submit Personal Details
```
POST http://localhost:8080/api/investor/introduced/step1
Body: {
  "uniqueCode": "abc-123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  ...
}
```
OTP sent to email.

### 4. Verify OTP
```
POST http://localhost:8080/api/investor/introduced/verify-otp
Body: {
  "uniqueCode": "abc-123",
  "emailOtp": "1234"
}
```

### 5. Complete Registration
```
POST http://localhost:8080/api/investor/introduced/complete
Body: {
  "uniqueCode": "abc-123",
  "selfOrLegalEntity": "Self",
  "nationality": "Indian",
  "panCardStatus": "Yes",
  "termsAccepted": true,
  ...
}
```
B2C account created, credentials email sent.

## Key Features

### Session Management
- Each registration has a unique session (`uniqueCode`)
- Tracks current step, consent status, OTP verification, completion status
- Stores investor details for final registration

### OTP Management
- 4-digit email OTP
- 10-minute expiry
- Maximum 3 attempts
- Resend functionality

### Data Validation
- Email uniqueness check
- Age validation (18+ years)
- Required field validation
- Conditional field validation based on nationality

### Error Handling
- Comprehensive error messages
- User-friendly alerts
- Backend validation responses
- Network error handling

## Security Considerations

1. **Session Isolation**: Each registration has a unique code
2. **OTP Security**: Time-limited, attempt-limited
3. **Data Privacy**: Consent recorded with timestamp
4. **B2C Password**: Default password requires change on first login (can be configured)

## Integration with Existing Systems

### Dataverse (Microsoft Dynamics CRM)
- Fetches investor details from `ss_investors` entity
- Retrieves broker, product, plan, scheme names

### User Management Service
- Creates B2C user accounts via Graph API
- Manages Azure AD B2C integration

### Email Service
- Sends OTP emails
- Sends credentials emails

## Future Enhancements

1. **Mobile OTP**: Add SMS-based OTP option
2. **Document Upload**: Add document upload in Step 4
3. **KYC Integration**: Real-time PAN/Aadhaar verification
4. **Progress Bar**: Visual progress indicator across steps
5. **Saved Progress**: Allow users to resume registration
6. **Multi-language**: Support for regional languages

## Laravel Reference Files

Original Laravel Blade templates used as reference:
- `docs/Investor/resources/views/investor/introduce-multiple-register-main-step.blade.php`
- `docs/Investor/resources/views/investor/data-consent-management.blade.php`
- `docs/Investor/resources/views/investor/introduce-register-step1.blade.php`
- `docs/Investor/resources/views/investor/introduce-register-step2.blade.php`
- `docs/Investor/resources/views/investor/introduce-register-step4.blade.php`
- `docs/Investor/app/Http/Controllers/InvestorController.php` (B2C logic)

## Maintenance Notes

- **No Impact on Existing Flows**: This is a completely separate flow with new database table and endpoints
- **Backward Compatible**: Old wizard route (`/investor/introduced/register`) remains unchanged
- **Scalable**: Can be extended for additional investor types (PMS, AIF, etc.)

## Support

For issues or questions:
- Backend: Review `IntroducedInvestorRegistrationService.java`
- Frontend: Review individual component files
- API Testing: Use Postman collection (to be created)
- Logs: Check Spring Boot application logs for detailed error traces

---

**Implementation Status**: ✅ Complete (Backend + Frontend)  
**Laravel Parity**: ✅ Achieved  
**B2C Integration**: ✅ Implemented  
**Testing**: Pending manual QA
