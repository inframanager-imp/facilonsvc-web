import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { batchRegistrationService, type BatchInvestorDto, type BatchRegistrationResponseDto } from '../../services/batchRegistration.service';
import { contentService } from '../../services/content.service';
import { toast } from 'react-toastify';
import { PremiumSelect } from '../../components/PremiumSelect/PremiumSelect';
import './BatchRegistrationForm.scss';

const emptyInvestor: BatchInvestorDto = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  mobilePhone: '',
  registerAs: 1,
  nationality: 0,
  market: 1,
};

export const BatchRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [brokerCode, setBrokerCode] = useState('');
  const [investors, setInvestors] = useState<BatchInvestorDto[]>([{ ...emptyInvestor }]);
  const [nationalities, setNationalities] = useState<{ id?: number; name?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchRegistrationResponseDto | null>(null);

  React.useEffect(() => {
    contentService.getNationalities().then((data) => setNationalities(data)).catch(() => {});
  }, []);

  const addInvestor = () => {
    if (investors.length >= 100) {
      toast.warn('Maximum 100 investors per batch');
      return;
    }
    setInvestors((prev) => [...prev, { ...emptyInvestor }]);
  };

  const removeInvestor = (index: number) => {
    if (investors.length <= 1) return;
    setInvestors((prev) => prev.filter((_, i) => i !== index));
  };

  const updateInvestor = (index: number, field: keyof BatchInvestorDto, value: string | number) => {
    setInvestors((prev) =>
      prev.map((inv, i) => (i === index ? { ...inv, [field]: value } : inv))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerCode.trim()) {
      toast.error('Broker code is required');
      return;
    }
    const valid = investors.filter(
      (i) => i.firstName?.trim() && i.lastName?.trim() && i.email?.trim() && i.mobilePhone?.trim()
    );
    if (valid.length === 0) {
      toast.error('Add at least one investor with required fields');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await batchRegistrationService.registerBatch({
        brokerCode: brokerCode.trim(),
        investors: valid,
      });
      setResult(response);
      toast.success(`Registered ${response.successCount} of ${response.totalCount} investors`);
      if (response.successCount > 0 && response.failureCount === 0) {
        setInvestors([{ ...emptyInvestor }]);
        setBrokerCode('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Batch registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="batch-registration-layout">
      <Header />
      <div className="dashboard-main-content">
        <div className="batch-registration">
          <h1>Batch Investor Registration</h1>
          <p className="batch-registration__subtitle">
            Register multiple investors at once. Each investor will receive a welcome email with temporary credentials.
          </p>

          <form onSubmit={handleSubmit} className="batch-registration__form">
            <div className="form-group">
              <label htmlFor="brokerCode">Broker / SP Code *</label>
              <input
                id="brokerCode"
                type="text"
                value={brokerCode}
                onChange={(e) => setBrokerCode(e.target.value)}
                required
                placeholder="e.g. BROKER001"
              />
            </div>

            <div className="form-section">
              <h3>Investors</h3>
              {investors.map((inv, index) => (
                <div key={index} className="investor-row">
                  <h4>Investor {index + 1}</h4>
                  <div className="investor-fields">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        value={inv.firstName}
                        onChange={(e) => updateInvestor(index, 'firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Middle Name</label>
                      <input
                        value={inv.middleName || ''}
                        onChange={(e) => updateInvestor(index, 'middleName', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        value={inv.lastName}
                        onChange={(e) => updateInvestor(index, 'lastName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={inv.email}
                        onChange={(e) => updateInvestor(index, 'email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile *</label>
                      <input
                        type="tel"
                        value={inv.mobilePhone}
                        onChange={(e) => updateInvestor(index, 'mobilePhone', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Register As</label>
                      <PremiumSelect
                        value={String(inv.registerAs)}
                        onChange={(val) => updateInvestor(index, 'registerAs', Number(val))}
                        options={[
                          { value: '1', label: 'Self' },
                          { value: '2', label: 'Legal Entity' },
                        ]}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nationality</label>
                      <PremiumSelect
                        value={String(inv.nationality || 0)}
                        onChange={(val) => updateInvestor(index, 'nationality', Number(val))}
                        options={[
                          { value: '0', label: 'Select' },
                          ...nationalities.map((n) => ({
                            value: String(n.id ?? 0),
                            label: n.name ?? ''
                          }))
                        ]}
                      />
                    </div>
                    <div className="form-group form-group--action">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeInvestor(index)}
                        disabled={investors.length <= 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline-primary" onClick={addInvestor}>
                + Add Investor
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Registering...' : 'Register All'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>
                Cancel
              </button>
            </div>
          </form>

          {result && (
            <div className="batch-registration__result">
              <h3>Result</h3>
              <p>
                Success: {result.successCount} | Failed: {result.failureCount} | Total: {result.totalCount}
              </p>
              {result.failures.length > 0 && (
                <div className="result-failures">
                  <h4>Failed</h4>
                  <ul>
                    {result.failures.map((f) => (
                      <li key={f.email}>
                        {f.email}: {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.successes.length > 0 && (
                <div className="result-successes">
                  <h4>Registered</h4>
                  <ul>
                    {result.successes.map((s) => (
                      <li key={s.email}>
                        {s.email} – Code: {s.uniqueCode}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};
