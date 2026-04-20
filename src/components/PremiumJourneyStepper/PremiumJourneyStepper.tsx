import React from 'react';
import { Link } from 'react-router-dom';
import { useSAProxyNavigation } from '../../hooks/useSAProxyNavigation';
import { type InvestorDashboardDto } from '../../services/investor.service';
import './PremiumJourneyStepper.scss';

interface Props {
  dashboardData: InvestorDashboardDto | null;
}

export const PremiumJourneyStepper: React.FC<Props> = ({ dashboardData }) => {
  const { navigate: saNavigate, isProxyMode } = useSAProxyNavigation();

  if (!dashboardData) return null;

  const progress = dashboardData.progress;
  const accountSummary = dashboardData.accountSummary;

  const isDoneFor = (key: string) => {
    if (key === 'information') return progress?.sections?.personalInfo?.completed || false;
    if (key === 'documents') return accountSummary ? accountSummary.kycDocumentsUploaded >= accountSummary.kycDocumentsRequired : false;
    if (key === 'onboarding') return accountSummary ? accountSummary.onboardingDocumentsUploaded >= accountSummary.onboardingDocumentsRequired : false;
    if (key === 'verification') return accountSummary?.verificationDone || false;
    if (key === 'physical') return accountSummary?.physicalSubmissionDone || false;
    if (key === 'account') return accountSummary?.accountOpeningStatus || false;
    return false;
  };

  const stepKeys = ['information', 'documents', 'onboarding', 'verification', 'physical', 'account'] as const;
  const currentStepKey = stepKeys.find((k) => !isDoneFor(k)) ?? 'information';

  const journeySteps = [
    { key: 'information', label: 'Information', icon: 'person-lines-fill', path: '/investor/profile' },
    { key: 'documents', label: 'KYC Docs', icon: 'file-earmark-lock-fill', path: '/investor/documents' },
    { key: 'onboarding', label: 'Onboarding', icon: 'file-earmark-richtext-fill', path: '/investor/documents' },
    { key: 'verification', label: 'Verification', icon: 'person-video', path: '/investor/verification' },
    { key: 'physical', label: 'Physical', icon: 'send-check-fill', path: '/investor/physical-submission' },
    { key: 'account', label: 'Account', icon: 'bank2', path: '/investor/account-details' },
  ];

  return (
    <div className="facilon-premium-journey-card card-ventura">
      <div className="journey-stepper-horizontal">
        {journeySteps.map((step, idx) => {
          const isDone = isDoneFor(step.key);
          const isCurrent = currentStepKey === step.key;
          const isPending = !isDone && !isCurrent;

          let statusText = "Pending";
          if (isDone) statusText = "Completed";
          else if (isCurrent) statusText = "In Progress";

          return (
            <div
              key={step.key}
              className={`journey-step-item ${isDone ? 'is-complete' : ''} ${isCurrent ? 'is-active' : ''} ${isPending ? 'is-pending' : ''}`}
            >
              <div
                className="step-node-container"
                onClick={() => saNavigate(step.path)}
                style={{ cursor: 'pointer' }}
              >
                <div className="step-connector-line" />
                <div className="step-circle">
                  <div className="circle-inner">
                    {isDone ? <i className="bi bi-check-lg"></i> : <i className={`bi bi-${step.icon}`}></i>}
                  </div>
                  {isCurrent && <div className="active-pulse-ring"></div>}
                </div>
              </div>

              <div className="step-caption-container">
                {/*<span className="step-number-label">STEP {idx + 1}</span>*/}
                <button
                  type="button"
                  className="step-title-link"
                  onClick={() => saNavigate(step.path)}
                >
                  {step.label}
                </button>
                {/* <div className={`status-pill pill-${statusText.toLowerCase().replace(' ', '-')}`}>
                  {statusText}
                </div> */}
              </div>
            </div>
          );
        })}
      </div>
      <div className="journey-header-modern">
        <div className="journey-title-group">
          <h2 className="journey-label-accent">Your Journey</h2>
        </div>

        <div className="journey-total-progress">
          {/* <span className="progress-label">FULL PROGRESS</span> */}
          <div className="progress-mini">
            <div
              className="fill"
              style={{ width: `${progress?.progressPercentage || 0}%` }}
            ></div>
          </div>
          <span className="value">{progress?.progressPercentage || 0}%</span>
        </div>
      </div>

    </div>
  );
};
