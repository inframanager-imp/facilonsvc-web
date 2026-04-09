import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileService, type OnboardingStatusDto } from '../../../services/profile.service';
import './OnboardingProgress.scss';

export const OnboardingProgress: React.FC = () => {
  const [status, setStatus] = useState<OnboardingStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    profileService
      .getOnboardingStatus()
      .then(setStatus)
      .catch(() => setError('Could not load onboarding status'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="onboarding-progress">
        <h3>Onboarding Progress</h3>
        <p className="onboarding-progress__loading">Loading...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="onboarding-progress">
        <h3>Onboarding Progress</h3>
        <p className="onboarding-progress__error">{error || 'Unable to load progress'}</p>
      </div>
    );
  }

  const steps = [
    { key: 'personalInfo', label: 'Personal Information', complete: status.personalInfoComplete, path: '/investor/profile' },
    { key: 'passport', label: 'Passport Details', complete: status.passportComplete, path: '/investor/profile' },
    { key: 'experience', label: 'Investment Experience', complete: status.experienceComplete, path: '/investor/profile' },
    { key: 'consents', label: 'Terms & Consents', complete: status.consentsComplete, path: '/investor/profile' },
    {
      key: 'kyc',
      label: `KYC Documents (${status.kycDocumentsUploaded}/${status.kycDocumentsRequired})`,
      complete: status.kycDocumentsComplete,
      path: '/investor/documents',
    },
  ];

  return (
    <div className="onboarding-progress">
      <h3>Onboarding Progress</h3>
      <div className="onboarding-progress__bar">
        <progress value={status.percentageComplete} max={100} />
      </div>
      <p className="onboarding-progress__summary">
        {status.completedSteps} of {status.totalSteps} steps complete ({status.percentageComplete}%)
      </p>

      <div className="onboarding-progress__steps">
        {steps.map((step) => (
          <div
            key={step.key}
            className={`onboarding-progress__step ${step.complete ? 'onboarding-progress__step--complete' : ''}`}
          >
            <span className="onboarding-progress__step-icon">
              {step.complete ? '✓' : '○'}
            </span>
            <Link to={step.path} className="onboarding-progress__step-label">
              {step.label}
            </Link>
          </div>
        ))}
      </div>

      {status.nextSteps.length > 0 && (
        <div className="onboarding-progress__next">
          <h4>Next Steps</h4>
          <ul>
            {status.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      {status.percentageComplete === 100 && (
        <p className="onboarding-progress__complete">All onboarding steps are complete!</p>
      )}
    </div>
  );
};
