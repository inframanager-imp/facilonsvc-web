import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSAProxyNavigation } from '../../hooks/useSAProxyNavigation';
import { type InvestorDashboardDto } from '../../services/investor.service';

interface Props {
  dashboardData: InvestorDashboardDto | null;
  compact?: boolean;
}

export const PremiumJourneyStepper: React.FC<Props> = ({ dashboardData, compact }) => {
  const { navigate: saNavigate } = useSAProxyNavigation();
  const { pathname } = useLocation();

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

  const journeySteps = [
    { key: 'information', label: 'Information', icon: 'bi-person-lines-fill', path: '/investor/journey' },
    { key: 'documents', label: 'KYC Docs', icon: 'bi-file-earmark-lock-fill', path: '/investor/documents' },
    { key: 'onboarding', label: 'Onboarding', icon: 'bi-file-earmark-richtext-fill', path: '/investor/onboarding' },
    { key: 'verification', label: 'Verification', icon: 'bi-person-video', path: '/investor/verification' },
    { key: 'physical', label: 'Physical', icon: 'bi-send-check-fill', path: '/investor/physical-submission' },
    { key: 'account', label: 'Account', icon: 'bi-bank2', path: '/investor/account-details' },
  ];

  const matchedStep = journeySteps.find((step) => {
    if (step.path === '/investor/journey') {
      return pathname.startsWith('/investor/journey');
    }
    return pathname === step.path;
  });

  const currentStepKey = matchedStep ? matchedStep.key : (stepKeys.find((k) => !isDoneFor(k)) ?? 'information');

  const stepperContent = (
    <div className="flex justify-between gap-2.5 relative">
      {journeySteps.map((step, idx) => {
        const isDone = isDoneFor(step.key);
        const isCurrent = currentStepKey === step.key;

        return (
          <div key={step.key} className="flex flex-col gap-0 items-center group relative">
            {/* Connector Line */}
            {idx < journeySteps.length - 1 && (
              <div className="absolute top-[14px] left-[50%] w-full h-[2px] bg-white/20 z-10 group-last:hidden">
                <div
                  className={`h-full bg-success-500 transition-all duration-500 ${isDone ? 'w-full' : 'w-0'}`}
                />
              </div>
            )}

            {/* Node */}
            <button
              onClick={() => saNavigate(step.path)}
              className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 z-10 mb-1
                ${isDone ? 'bg-success-500 border-0' : isCurrent ? 'bg-white border-0' : 'bg-[#7facb7] border border-[#325f6a]'}
                hover:scale-110 active:scale-95 shadow-sm
              `}
            >
              {isDone ? (
                <i className="bi bi-check-lg text-white text-base font-bold"></i>
              ) : (
                <i className={`${step.icon} text-xs ${isCurrent ? 'text-primary-600 font-bold' : 'text-[#325f6a]'}`}></i>
              )}

              {/* Active Pulse */}
              {isCurrent && (
                <div className="absolute -inset-1 border-2 border-white rounded-full animate-ping opacity-30" />
              )}
            </button>

            {/* Label */}
            <button
              onClick={() => saNavigate(step.path)}
              className={`text-[10px] font-medium transition-colors
                ${isDone ? 'text-white/80 hover:text-white' : isCurrent ? 'text-white font-bold' : 'text-white/50 hover:text-white/80'}
              `}
            >
              {step.label}
            </button>
          </div>
        );
      })}
    </div>
  );

  if (compact) {
    return stepperContent;
  }

  return (
    <div className="bg-primary-500 border-1 border-neutral-200 rounded-md p-2 flex justify-between lg:flex-row items-center gap-6 mb-6 w-full">
      {/* Journey Header */}
      <div className="flex flex-col gap-0 min-w-[120px]">
        <h2 className="text-white font-bold text-sm tracking-tight uppercase mb-0">Your Journey</h2>
      </div>

      {/* Stepper Content */}
      {stepperContent}
    </div>
  );
};
