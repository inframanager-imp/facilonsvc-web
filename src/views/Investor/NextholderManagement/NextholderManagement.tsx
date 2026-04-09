import React, { useState } from 'react';
import Header from '../../../components/Header/Header';
import { NextholderList } from './NextholderList/NextholderList';
import { NextholderForm } from './NextholderForm/NextholderForm';
import { InvitationManager } from './InvitationManager/InvitationManager';
import { NextholderDto } from '../../../services/nextholder.service';
import './NextholderManagement.scss';

export const NextholderManagement: React.FC = () => {
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
        <div className="dashboard-layout">
            <Header />
            <div className="dashboard-main-content">
                <div className="nextholder-management">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
            </div>
        </div>
    );
};
