import React, { useState } from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { NextholderList } from './NextholderList/NextholderList';
import { NextholderForm } from './NextholderForm/NextholderForm';
import { InvitationManager } from './InvitationManager/InvitationManager';
import { NextholderDto } from '../../../services/nextholder.service';
import { useSAProxyNavigation } from '../../../hooks/useSAProxyNavigation';
import '../InvestorProfile/InvestorProfile.scss';
import './NextholderManagement.scss';

export const NextholderManagement: React.FC = () => {
    const { isProxyMode } = useSAProxyNavigation();
    const [activeTab, setActiveTab] = useState<'nextholders' | 'invitations'>('nextholders');
    const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
    const [selectedNextholder, setSelectedNextholder] = useState<NextholderDto | undefined>(undefined);

    const handleAdd = () => {
        setSelectedNextholder(undefined);
        setViewMode('add');
    };

    const handleEdit = (nextholder: NextholderDto) => {
        setSelectedNextholder(nextholder);
        setViewMode('edit');
    };

    const handleSuccess = () => {
        setViewMode('list');
        setSelectedNextholder(undefined);
    };

    const handleCancel = () => {
        setViewMode('list');
        setSelectedNextholder(undefined);
    };

    return (
        <div className="facilon-dashboard-wrapper">
            {!isProxyMode && <Header />}
            <main className="container-fluid dashboard-container-main">
                <div className="nextholder-management">
                    <div className="profile-header">
                        <h1>Manage Nextholders</h1>
                    </div>

                    <div className="investor-profile__tabs" style={{ marginBottom: '20px' }}>
                        <button
                            className={activeTab === 'nextholders' ? 'active' : ''}
                            onClick={() => { setActiveTab('nextholders'); setViewMode('list'); }}
                        >
                            My Family / Nextholders
                        </button>
                        <button
                            className={activeTab === 'invitations' ? 'active' : ''}
                            onClick={() => setActiveTab('invitations')}
                        >
                            Invitations
                        </button>
                    </div>

                    {activeTab === 'nextholders' && (
                        <>
                            {viewMode === 'list' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                        <button className="btn-primary" onClick={handleAdd}>
                                            + Add New Nextholder
                                        </button>
                                    </div>
                                    <NextholderList onEdit={handleEdit} />
                                </div>
                            )}

                            {(viewMode === 'add' || viewMode === 'edit') && (
                                <NextholderForm
                                    initialData={selectedNextholder}
                                    onSuccess={handleSuccess}
                                    onCancel={handleCancel}
                                />
                            )}
                        </>
                    )}

                    {activeTab === 'invitations' && (
                        <InvitationManager />
                    )}
                </div>
            </main>
            {!isProxyMode && <Footer />}
        </div>
    );
};
