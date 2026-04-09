import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import { investorService, InvestorDashboardDto } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';

export const InvestorProgress: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<InvestorDashboardDto | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await investorService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    // Helper to determine class based on status
    // In Laravel: 
    // 1 (Complete) -> active-one (Tick)
    // 0 (Not Started) -> circle-chart with "Start"
    // 2 (Partial/Pending) -> active-three (20%) etc.

    // We need to map our API status to these visual states.
    // Assuming our API returns `completedSteps` array.

    const isCompleted = (stepKey: string) => {
        return dashboardData?.progress?.completedSteps?.includes(stepKey);
    };

    const isCurrent = (stepKey: string) => {
        return dashboardData?.progress?.currentStep === stepKey;
    };

    // Render a step
    const renderStep = (label: string, route: string, stepKey: string, percent: string = "20%") => {
        const completed = isCompleted(stepKey);
        // data.progress.sections also has 'completed' boolean
        const sectionStatus = dashboardData?.progress?.sections?.[stepKey];
        const isDone = sectionStatus?.completed || completed;

        return (
            <div className={`step`}>
                {isDone ? (
                    <div className="circle-chart active-one">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                ) : (
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(route); }} style={{ textDecoration: 'none' }}>
                        <div className={`circle-chart ${isCurrent(stepKey) ? 'active-three' : ''}`}>
                            {isCurrent(stepKey) ? percent : 'Start'}
                        </div>
                    </a>
                )}
                <p>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(route); }}>{label}</a>
                </p>
            </div>
        );
    };

    return (
        <div className="dashboard-layout investor-dashboard-layout">
            <Header />
            <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
                <div className="container-fluid">
                    <center>
                        <strong>
                            <h2 style={{ fontSize: '36px', color: '#be1717', fontWeight: 500, marginTop: '6%' }}>
                                Your Journey
                            </h2>
                        </strong>
                    </center>

                    <div className="step-progress">
                        {/* 1. Submit Information */}
                        {renderStep('Submit Information', '/investor/profile', 'information', '90%')}

                        {/* 2. KYC Documents */}
                        {renderStep('KYC Documents', '/investor/documents', 'documents', '50%')}

                        {/* 3. Onboarding Forms */}
                        {renderStep('Onboarding Forms', '/investor/documents', 'onboarding', '20%')}

                        {/* 4. In-person Verification */}
                        {renderStep('In-person Verification', '/investor/verification', 'verification', '0%')}

                        {/* 5. Physical Submission */}
                        {renderStep('Physical Submission', '/investor/physical-submission', 'physical', '0%')}

                        {/* 6. Account Details */}
                        {renderStep('Account Details', '/investor/account-details', 'account', '0%')}
                    </div>
                </div>
            </div>
        </div>
    );
};
