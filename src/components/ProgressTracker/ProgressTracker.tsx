import React from 'react';
import './ProgressTracker.scss';

export interface ProgressTrackerProps {
    currentStep: string;
    completedSteps: string[];
    pendingSteps: string[];
    progressPercentage: number;
}

const stepLabels: Record<string, string> = {
    registration: 'Registration',
    information: 'Information',
    documents: 'Documents',
    verification: 'Verification',
    completed: 'Completed',
};

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
    currentStep,
    completedSteps,
    pendingSteps,
    progressPercentage,
}) => {
    const allSteps = ['registration', 'information', 'documents', 'verification'];

    const getStepStatus = (step: string): 'completed' | 'current' | 'pending' => {
        if (completedSteps.includes(step)) return 'completed';
        if (step === currentStep) return 'current';
        return 'pending';
    };

    return (
        <div className="progress-tracker">
            <div className="progress-tracker__header">
                <h3>Your Onboarding Progress</h3>
                <div className="progress-tracker__percentage">
                    <span className="percentage-value">{progressPercentage}%</span>
                    <span className="percentage-label">Complete</span>
                </div>
            </div>

            <div className="progress-tracker__bar">
                <div
                    className="progress-tracker__bar-fill"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            <div className="progress-tracker__steps">
                {allSteps.map((step, index) => {
                    const status = getStepStatus(step);
                    return (
                        <div
                            key={step}
                            className={`progress-tracker__step progress-tracker__step--${status}`}
                        >
                            <div className="step-indicator">
                                {status === 'completed' ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                ) : (
                                    <span className="step-number">{index + 1}</span>
                                )}
                            </div>
                            <div className="step-label">{stepLabels[step]}</div>
                            {index < allSteps.length - 1 && (
                                <div className={`step-connector step-connector--${status}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
