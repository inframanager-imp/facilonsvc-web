import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import { investorService, InvestorDashboardDto } from '../../../services/investor.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import { PremiumJourneyStepper } from '../../../components/PremiumJourneyStepper/PremiumJourneyStepper';
import '../InvestorProfile/InvestorProfile.scss';

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

    return (
        <div className="dashboard-layout investor-dashboard-layout">
            <Header />
            <div className="dashboard-main-content" style={{ marginLeft: 0 }}>
                <div className="investor-profile">
                    <PremiumJourneyStepper dashboardData={dashboardData} />
                </div>
            </div>
        </div>
    );
};
