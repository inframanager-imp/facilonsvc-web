import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { profileService, type OnboardingStatusDto } from '../../../services/profile.service';
import './OnboardingProgress.scss';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';

export const OnboardingProgress: React.FC = () => {
  const navigate = useNavigate();
  const { navigate: saNavigate, isProxyMode } = useSAProxyNavigation();
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
      <div className="onboarding-card-loading">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        <span>Calculating progress...</span>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="onboarding-card-error alert alert-danger">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error || 'Unable to load progress'}
      </div>
    );
  }

  // Define steps to match the 6-step journey in the user's reference image
  const journeySteps = [
    { 
      key: 'information', 
      label: 'Information', 
      icon: 'person-lines-fill', 
      path: '/investor/profile',
      complete: status.personalInfoComplete && status.passportComplete 
    },
    { 
      key: 'kyc', 
      label: 'KYC Docs', 
      icon: 'file-earmark-lock-fill', 
      path: '/investor/documents',
      complete: status.kycDocumentsComplete 
    },
    { 
      key: 'onboarding', 
      label: 'Onboarding', 
      icon: 'file-earmark-richtext-fill', 
      path: '/investor/documents',
      complete: status.experienceComplete && status.consentsComplete 
    },
    { 
      key: 'verification', 
      label: 'Verification', 
      icon: 'person-video', 
      path: '/investor/verification',
      complete: false // Placeholder
    },
    { 
      key: 'physical', 
      label: 'Physical', 
      icon: 'send-check-fill', 
      path: '/investor/physical-submission',
      complete: false // Placeholder
    },
    { 
      key: 'account', 
      label: 'Account', 
      icon: 'bank2', 
      path: '/investor/account-details',
      complete: false // Placeholder
    },
  ];

  const currentStepIndex = journeySteps.findIndex(s => !s.complete);
  const activeStepKey = currentStepIndex !== -1 ? journeySteps[currentStepIndex].key : 'account';

  return (
    <div className="facilon-premium-journey-card card-ventura border-0">
      <div className="journey-header-modern">
        <div className="journey-title-group">
          <h2 className="journey-label-accent">YOUR JOURNEY</h2>
        </div>
        
        <div className="journey-full-progress">
          <span className="progress-label">FULL PROGRESS</span>
          <div className="progress-track-bg">
            <div 
              className="progress-track-fill" 
              style={{ width: `${status.percentageComplete}%` }}
            ></div>
          </div>
          <span className="progress-percentage">{status.percentageComplete}%</span>
        </div>
      </div>

      <div className="journey-stepper-horizontal">
        {journeySteps.map((step, index) => {
          const isComplete = step.complete;
          const isActive = step.key === activeStepKey;
          const isPending = !isComplete && !isActive;
          
          let statusText = "Pending";
          if (isComplete) statusText = "Completed";
          else if (isActive) statusText = "In Progress";

          return (
            <div 
              key={step.key} 
              className={`journey-step-item ${isComplete ? 'is-complete' : ''} ${isActive ? 'is-active' : ''} ${isPending ? 'is-pending' : ''}`}
            >
              <div 
                className="step-node-container" 
                onClick={() => isProxyMode ? saNavigate(step.path) : navigate(step.path)}
                style={{ cursor: 'pointer' }}
              >
                <div className="step-connector-line" />
                <div className="step-circle">
                  <div className="circle-inner">
                    {isComplete ? (
                      <i className="bi bi-check-lg"></i>
                    ) : (
                      <i className={`bi bi-${step.icon}`}></i>
                    )}
                  </div>
                  {isActive && <div className="active-pulse-ring" />}
                </div>
              </div>

              <div className="step-caption-container">
                <span className="step-number-label">STEP {index + 1}</span>
                <Link to={step.path} className="step-title-link">
                  {step.label}
                </Link>
                <div className={`status-pill pill-${statusText.toLowerCase().replace(' ', '-')}`}>
                  {statusText}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="journey-action-footer mt-5">
        <div className="d-flex justify-content-between align-items-center">
          <div className="footer-status-text">
            {status.percentageComplete === 100 
              ? "Congratulations! Your journey is complete." 
              : `You are ${status.percentageComplete}% through the onboarding process.`}
          </div>
          <Link to={journeySteps.find(s => !s.complete)?.path || '#'} className="btn btn-journey-continue">
            {status.percentageComplete === 100 ? 'Go to Dashboard' : 'Continue Journey'}
            <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

const getIconForStep = (key: string) => {
  switch (key) {
    case 'personalInfo': return 'person-vcard';
    case 'passport': return 'passport';
    case 'experience': return 'briefcase';
    case 'consents': return 'pencil-square';
    case 'kyc': return 'file-earmark-arrow-up';
    default: return 'dot';
  }
};

const getSubtextForStep = (key: string, status: any) => {
  switch (key) {
    case 'personalInfo': return 'Tell us more about yourself';
    case 'passport': return 'Valid ID verification';
    case 'experience': return 'Answer a few questions about your history';
    case 'consents': return 'Sign our digital terms';
    case 'kyc': return `Upload required documents (${status.kycDocumentsRequired})`;
    default: return '';
  }
};
