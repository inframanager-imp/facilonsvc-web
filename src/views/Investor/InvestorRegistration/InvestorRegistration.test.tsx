import React from 'react';
import { render, screen, waitFor, within, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { InvestorRegistration } from './InvestorRegistration';
import { investorService } from '../../../services/investor.service';
import { contentService } from '../../../services/content.service';

jest.mock('../../../services/investor.service');
jest.mock('../../../services/content.service');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockInvestorService = investorService as jest.Mocked<typeof investorService>;
const mockContentService = contentService as jest.Mocked<typeof contentService>;

const defaultCountries = [
  { myRowId: 1, id: 1, ssName: 'India', ssIsdCode: '91' },
  { myRowId: 2, id: 2, ssName: 'United States', ssIsdCode: '1' },
];
const defaultTitles = [
  { myRowId: 1, id: 1, ssName: 'Mr.' },
  { myRowId: 2, id: 2, ssName: 'Ms.' },
];
const defaultGenders = [
  { myRowId: 1, id: 1, ssName: 'Male' },
  { myRowId: 2, id: 2, ssName: 'Female' },
];
const defaultMarketTypes = [
  { myRowId: 1, id: 1, marketName: 'India' },
  { myRowId: 2, id: 2, marketName: 'International' },
];
const defaultNationalities = [
  { myRowId: 1, id: 1, name: 'Indian' },
  { myRowId: 2, id: 2, name: 'American' },
];

const otpResponse = { message: 'OTP sent', emailSent: true, smsSent: false, expiresInMinutes: 15 };

function renderWithRouter(ui: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/investor/register']}>
      {ui}
    </MemoryRouter>
  );
}

function setupContentMocks() {
  mockContentService.getCountries = jest.fn().mockResolvedValue(defaultCountries);
  mockContentService.getTitles = jest.fn().mockResolvedValue(defaultTitles);
  mockContentService.getGenders = jest.fn().mockResolvedValue(defaultGenders);
  mockContentService.getMarketTypes = jest.fn().mockResolvedValue(defaultMarketTypes);
  mockContentService.getNationalities = jest.fn().mockResolvedValue(defaultNationalities);
}

describe('InvestorRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupContentMocks();
  });

  describe('Individual registration flow', () => {
    it('renders step 1 with Individual selected and Full Name label', async () => {
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => {
        expect(screen.getByText('Investor Registration')).toBeInTheDocument();
      });
      expect(screen.getByPlaceholderText(/Enter your full name/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Individual (Self)')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Basic Information/i })).toBeInTheDocument();
    });

    it('shows validation when submitting step 1 without full name', async () => {
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => expect(screen.getByText('Continue')).toBeInTheDocument());
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
      await waitFor(() => {
        expect(mockInvestorService.registerMainStep).not.toHaveBeenCalled();
      });
      expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
    });

    it('shows validation when full name is too short', async () => {
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => expect(screen.getByPlaceholderText(/Enter your full name/i)).toBeInTheDocument());
      await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'X');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
      await waitFor(() => expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeInTheDocument());
      expect(mockInvestorService.registerMainStep).not.toHaveBeenCalled();
    });

    it('calls registerMainStep and advances to step 2 on valid individual step 1', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501011234');
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => expect(screen.getByPlaceholderText(/Enter your full name/i)).toBeInTheDocument());

      await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'John Doe');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await waitFor(() => {
        expect(mockInvestorService.registerMainStep).toHaveBeenCalledWith(
          expect.objectContaining({ fullName: 'John Doe', registerAs: 1, market: 1 })
        );
      });
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Personal Details/i })).toBeInTheDocument();
      });
    });

    it('step 2 shows Title, First Name, Last Name, Email, Mobile and Send OTP button', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501011234');
      renderWithRouter(<InvestorRegistration />);
      await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'Jane Doe');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await waitFor(() => expect(screen.getByPlaceholderText(/As per government ID/)).toBeInTheDocument());
      expect(screen.getByText(/Title \*/)).toBeInTheDocument();
      expect(screen.getByText(/Last Name \*/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Email address/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Mobile number/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send OTP/i })).toBeInTheDocument();
    });

    it('step 2 validation: requires title, first name, last name, email, mobile', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501011234');
      renderWithRouter(<InvestorRegistration />);
      await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'Jane');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await waitFor(() => expect(screen.getByRole('button', { name: /Send OTP/i })).toBeInTheDocument());
      await userEvent.click(screen.getByRole('button', { name: /Send OTP/i }));
      await waitFor(() => {
        expect(mockInvestorService.registerStep1).not.toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('step 2 success: calls registerStep1 and shows email OTP step (no SMS OTP)', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501011234');
      mockInvestorService.registerStep1.mockResolvedValue(otpResponse);
      renderWithRouter(<InvestorRegistration />);
      await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'Jane');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await waitFor(() => expect(screen.getByPlaceholderText(/As per government ID/)).toBeInTheDocument());
      const combos = screen.getAllByRole('combobox');
      await userEvent.selectOptions(combos[0], '1');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[0], 'Jane');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[1], 'Doe');
      await userEvent.type(screen.getByPlaceholderText(/Email address/), 'jane@example.com');
      await userEvent.type(screen.getByPlaceholderText(/Mobile number/), '9876543210');
      await userEvent.click(screen.getByRole('button', { name: /Send OTP/i }));

      await waitFor(() => {
        expect(mockInvestorService.registerStep1).toHaveBeenCalledWith(
          '202501011234',
          expect.objectContaining({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' })
        );
      });
      await waitFor(() => {
        expect(screen.getByLabelText(/Email OTP/i)).toBeInTheDocument();
      });
      // SMS OTP field should NOT be present
      expect(screen.queryByLabelText(/SMS OTP/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verify & Continue/i })).toBeInTheDocument();
    });

    it('step 4: shows Citizenship, Country of Residence, PAN, OCI, Indian Origin, consents', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501011234');
      mockInvestorService.registerStep1.mockResolvedValue(otpResponse);
      mockInvestorService.verifyOtp.mockResolvedValue({ success: true, message: 'OK', investorId: 1, uniqueCode: '202501011234' });
      renderWithRouter(<InvestorRegistration />);
      await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'Test');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
      await waitFor(() => screen.getByRole('button', { name: /Send OTP/i }));
      await userEvent.selectOptions(screen.getAllByRole('combobox')[0], '1');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[0], 'Test');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[1], 'User');
      await userEvent.type(screen.getByPlaceholderText(/Email address/), 'a@b.com');
      await userEvent.type(screen.getByPlaceholderText(/Mobile number/), '9999999999');
      await userEvent.click(screen.getByRole('button', { name: /Send OTP/i }));
      await waitFor(() => screen.getByLabelText(/Email OTP/i));
      await userEvent.type(screen.getByLabelText(/Email OTP/i), '1234');
      await userEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));

      await waitFor(() => expect(screen.getByText(/Citizenship \*/)).toBeInTheDocument());
      expect(screen.getByText(/Country of Residence \*/)).toBeInTheDocument();
      expect(screen.getByText(/Do you have a PAN Card/i)).toBeInTheDocument();
      expect(screen.getByText(/Do you have an OCI Card/i)).toBeInTheDocument();
      expect(screen.getByText(/Are you of Indian Origin/i)).toBeInTheDocument();
      expect(screen.getByText(/information provided is correct/i)).toBeInTheDocument();
      expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
      expect(screen.getByText(/receive notifications from Facilon/i)).toBeInTheDocument();
    });
  });

  describe('Legal Entity registration flow', () => {
    jest.setTimeout(15000);

    it('switching to Legal Entity shows entity name label and entity-specific fields', async () => {
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => expect(screen.getByDisplayValue('Individual (Self)')).toBeInTheDocument());
      await userEvent.selectOptions(screen.getByDisplayValue('Individual (Self)'), '2');

      expect(screen.getByPlaceholderText(/Enter legal entity name/i)).toBeInTheDocument();
      expect(screen.getByText(/Country of Incorporation \*/)).toBeInTheDocument();
      expect(screen.getByText(/Country of Tax Residency \*/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/www.example.com/i)).toBeInTheDocument();
    });

    it('legal entity step 1: validates country of incorporation and tax residency required', async () => {
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => screen.getByDisplayValue('Individual (Self)'));
      await userEvent.selectOptions(screen.getByDisplayValue('Individual (Self)'), '2');
      await userEvent.type(screen.getByPlaceholderText(/Enter legal entity name/i), 'Acme Corp');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
      await waitFor(() => {
        expect(mockInvestorService.registerMainStep).not.toHaveBeenCalled();
      });
    });

    it('legal entity step 1: invalid website format shows validation', async () => {
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => screen.getByDisplayValue('Individual (Self)'));
      await userEvent.selectOptions(screen.getByDisplayValue('Individual (Self)'), '2');
      await waitFor(() => expect(screen.getByLabelText(/Country of Incorporation/i)).toBeInTheDocument());
      await userEvent.type(screen.getByPlaceholderText(/Enter legal entity name/i), 'Acme Corp');
      await userEvent.selectOptions(screen.getByLabelText(/Country of Incorporation/i), '1');
      await userEvent.selectOptions(screen.getByLabelText(/Country of Tax Residency/i), '1');
      await userEvent.type(screen.getByPlaceholderText(/www.example.com/i), 'invalid');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
      await waitFor(() => {
        expect(mockInvestorService.registerMainStep).not.toHaveBeenCalled();
      });
    });

    it('legal entity step 1: valid www website passes and calls registerMainStep', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501019999');
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => screen.getByDisplayValue('Individual (Self)'));
      await userEvent.selectOptions(screen.getByDisplayValue('Individual (Self)'), '2');
      await waitFor(() => expect(screen.getByLabelText(/Country of Incorporation/i)).toBeInTheDocument());
      await userEvent.type(screen.getByPlaceholderText(/Enter legal entity name/i), 'Acme Corp');
      await userEvent.selectOptions(screen.getByLabelText(/Country of Incorporation/i), '1');
      await userEvent.selectOptions(screen.getByLabelText(/Country of Tax Residency/i), '1');
      await userEvent.type(screen.getByPlaceholderText(/www.example.com/i), 'www.acme.com');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await waitFor(() => {
        expect(mockInvestorService.registerMainStep).toHaveBeenCalledWith(
          expect.objectContaining({ fullName: 'Acme Corp', registerAs: 2, countryOfIncorporation: 1, entityWebsite: 'www.acme.com' })
        );
      });
    });

    it('legal entity step 2: shows Authorized Representative Details and capacity field', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501019999');
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => screen.getByDisplayValue('Individual (Self)'));
      await userEvent.selectOptions(screen.getByDisplayValue('Individual (Self)'), '2');
      await waitFor(() => expect(screen.getByLabelText(/Country of Incorporation/i)).toBeInTheDocument());
      await waitFor(() => {
        const incorpSelect = screen.getByLabelText(/Country of Incorporation/i);
        const options = within(incorpSelect).getAllByRole('option');
        return options.length > 1;
      }, { timeout: 3000 });
      await userEvent.type(screen.getByPlaceholderText(/Enter legal entity name/i), 'Acme');
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Country of Incorporation/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Country of Tax Residency/i), { target: { value: '1' } });
      });
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Authorized Representative Details/i })).toBeInTheDocument();
      });
      expect(screen.getByText(/Capacity Representing the Legal Entity/i)).toBeInTheDocument();
    });

    it('legal entity step 2: rejects personal email (gmail) and does not call registerStep1', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501019999');
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => screen.getByDisplayValue('Individual (Self)'));
      await userEvent.selectOptions(screen.getByDisplayValue('Individual (Self)'), '2');
      await waitFor(() => expect(screen.getByLabelText(/Country of Incorporation/i)).toBeInTheDocument());
      await waitFor(() => {
        const incorpSelect = screen.getByLabelText(/Country of Incorporation/i);
        const options = within(incorpSelect).getAllByRole('option');
        return options.length > 1;
      }, { timeout: 3000 });
      await userEvent.type(screen.getByPlaceholderText(/Enter legal entity name/i), 'Acme');
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Country of Incorporation/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Country of Tax Residency/i), { target: { value: '1' } });
      });
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await waitFor(() => screen.getByRole('button', { name: /Send OTP/i }));
      await userEvent.selectOptions(screen.getByLabelText(/Title \*/i), '1');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[0], 'John');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[1], 'Director');
      await userEvent.type(screen.getByPlaceholderText(/Corporate email/), 'john@gmail.com');
      await userEvent.type(screen.getByPlaceholderText(/Mobile number/), '9876543210');
      await userEvent.click(screen.getByRole('button', { name: /Send OTP/i }));

      await waitFor(() => {
        expect(mockInvestorService.registerStep1).not.toHaveBeenCalled();
      });
    });

    it('legal entity step 2: accepts corporate email and calls registerStep1', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501019999');
      mockInvestorService.registerStep1.mockResolvedValue(otpResponse);
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => screen.getByDisplayValue('Individual (Self)'));
      await userEvent.selectOptions(screen.getByDisplayValue('Individual (Self)'), '2');
      await waitFor(() => expect(screen.getByLabelText(/Country of Incorporation/i)).toBeInTheDocument());
      await waitFor(() => {
        const incorpSelect = screen.getByLabelText(/Country of Incorporation/i);
        const options = within(incorpSelect).getAllByRole('option');
        return options.length > 1;
      }, { timeout: 3000 });
      await userEvent.type(screen.getByPlaceholderText(/Enter legal entity name/i), 'Acme');
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Country of Incorporation/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Country of Tax Residency/i), { target: { value: '1' } });
      });
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await waitFor(() => screen.getByRole('button', { name: /Send OTP/i }));
      await userEvent.selectOptions(screen.getByLabelText(/Title \*/i), '1');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[0], 'John');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[1], 'Director');
      await userEvent.type(screen.getByPlaceholderText(/Corporate email/), 'john@acmecorp.com');
      await userEvent.type(screen.getByPlaceholderText(/Mobile number/), '9876543210');
      await userEvent.click(screen.getByRole('button', { name: /Send OTP/i }));

      await waitFor(() => {
        expect(mockInvestorService.registerStep1).toHaveBeenCalledWith(
          '202501019999',
          expect.objectContaining({ email: 'john@acmecorp.com' })
        );
      });
    });

    it('legal entity step 4: shows WhatsApp consent as optional', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501019999');
      mockInvestorService.registerStep1.mockResolvedValue(otpResponse);
      mockInvestorService.verifyOtp.mockResolvedValue({ success: true, message: 'OK', uniqueCode: '202501019999' });
      renderWithRouter(<InvestorRegistration />);
      await waitFor(() => screen.getByDisplayValue('Individual (Self)'));
      await userEvent.selectOptions(screen.getByDisplayValue('Individual (Self)'), '2');
      await waitFor(() => expect(screen.getByLabelText(/Country of Incorporation/i)).toBeInTheDocument());
      await waitFor(() => {
        const incorpSelect = screen.getByLabelText(/Country of Incorporation/i);
        const options = within(incorpSelect).getAllByRole('option');
        return options.length > 1;
      }, { timeout: 3000 });
      await userEvent.type(screen.getByPlaceholderText(/Enter legal entity name/i), 'Acme');
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Country of Incorporation/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Country of Tax Residency/i), { target: { value: '1' } });
      });
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
      await waitFor(() => screen.getByRole('button', { name: /Send OTP/i }), { timeout: 5000 });
      await userEvent.selectOptions(screen.getByLabelText(/Title \*/i), '1');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[0], 'Acme');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[1], 'Rep');
      await userEvent.type(screen.getByPlaceholderText(/Corporate email/), 'a@company.org');
      await userEvent.type(screen.getByPlaceholderText(/Mobile number/), '9999999999');
      await userEvent.click(screen.getByRole('button', { name: /Send OTP/i }));
      await waitFor(() => screen.getByLabelText(/Email OTP/i));
      await userEvent.type(screen.getByLabelText(/Email OTP/i), '1234');
      await userEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));

      await waitFor(() => expect(screen.getByText(/Citizenship \*/)).toBeInTheDocument());
      expect(screen.getByText(/WhatsApp notifications.*Optional for corporate/i)).toBeInTheDocument();
    });
  });

  describe('Step 4 completion and navigation', () => {
    it('step 4: missing consents prevent submit', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501011234');
      mockInvestorService.registerStep1.mockResolvedValue(otpResponse);
      mockInvestorService.verifyOtp.mockResolvedValue({ success: true, message: 'OK', uniqueCode: '202501011234' });
      renderWithRouter(<InvestorRegistration />);
      await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'Test');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
      await waitFor(() => screen.getByRole('button', { name: /Send OTP/i }));
      await userEvent.selectOptions(screen.getAllByRole('combobox')[0], '1');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[0], 'Test');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[1], 'User');
      await userEvent.type(screen.getByPlaceholderText(/Email address/), 'x@y.com');
      await userEvent.type(screen.getByPlaceholderText(/Mobile number/), '9999999999');
      await userEvent.click(screen.getByRole('button', { name: /Send OTP/i }));
      await waitFor(() => screen.getByLabelText(/Email OTP/i));
      await userEvent.type(screen.getByLabelText(/Email OTP/i), '1234');
      await userEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));

      await waitFor(() => expect(screen.getByText(/Citizenship \*/)).toBeInTheDocument());
      const step4Combos = screen.getAllByRole('combobox');
      await userEvent.selectOptions(step4Combos[0], '1');
      await userEvent.selectOptions(step4Combos[1], '1');
      await userEvent.selectOptions(step4Combos[2], '1');
      await userEvent.selectOptions(step4Combos[4], 'yes');
      await userEvent.selectOptions(step4Combos[5], 'yes');
      await userEvent.selectOptions(step4Combos[6], 'yes');
      await userEvent.click(screen.getByRole('button', { name: /Complete Registration/i }));
      await waitFor(() => {
        expect(mockInvestorService.registerStep3).not.toHaveBeenCalled();
      });
    });

    it('step 4: full valid submission calls registerStep3 and navigates to login', async () => {
      mockInvestorService.registerMainStep.mockResolvedValue('202501011234');
      mockInvestorService.registerStep1.mockResolvedValue(otpResponse);
      mockInvestorService.verifyOtp.mockResolvedValue({ success: true, message: 'OK', uniqueCode: '202501011234' });
      mockInvestorService.registerStep3.mockResolvedValue({ success: true, message: 'Registration completed', investorId: 1 });
      renderWithRouter(<InvestorRegistration />);
      await userEvent.type(screen.getByPlaceholderText(/Enter your full name/i), 'Full');
      await userEvent.click(screen.getByRole('button', { name: /Continue/i }));
      await waitFor(() => screen.getByRole('button', { name: /Send OTP/i }));
      await userEvent.selectOptions(screen.getAllByRole('combobox')[0], '1');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[0], 'Full');
      await userEvent.type(screen.getAllByPlaceholderText(/As per government ID/)[1], 'User');
      await userEvent.type(screen.getByPlaceholderText(/Email address/), 'full@user.com');
      await userEvent.type(screen.getByPlaceholderText(/Mobile number/), '9999999999');
      await userEvent.click(screen.getByRole('button', { name: /Send OTP/i }));
      await waitFor(() => screen.getByLabelText(/Email OTP/i));
      await userEvent.type(screen.getByLabelText(/Email OTP/i), '1234');
      await userEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));

      await waitFor(() => expect(screen.getByText(/Citizenship \*/)).toBeInTheDocument());
      const step4Combos = screen.getAllByRole('combobox');
      await userEvent.selectOptions(step4Combos[0], '1');
      await userEvent.selectOptions(step4Combos[1], '1');
      await userEvent.selectOptions(step4Combos[2], '1');
      await userEvent.selectOptions(step4Combos[4], 'yes');
      await userEvent.selectOptions(step4Combos[5], 'yes');
      await userEvent.selectOptions(step4Combos[6], 'yes');
      await userEvent.click(screen.getByRole('checkbox', { name: /information provided is correct/i }));
      await userEvent.click(screen.getByRole('checkbox', { name: /Privacy Policy/i }));
      await userEvent.click(screen.getByRole('checkbox', { name: /receive notifications from Facilon/i }));
      await userEvent.click(screen.getByRole('button', { name: /Complete Registration/i }));

      await waitFor(() => {
        expect(mockInvestorService.registerStep3).toHaveBeenCalledWith(
          '202501011234',
          expect.objectContaining({ confirmation: true, privacyPolicyAccepted: true, notificationConsent: true })
        );
      });
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });
});
