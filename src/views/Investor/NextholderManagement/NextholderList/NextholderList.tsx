import React, { useState, useEffect } from 'react';
import { NextholderDto, nextholderService } from '../../../../services/nextholder.service';
import { toast } from 'react-toastify';
import './../NextholderManagement.scss';

interface NextholderListProps {
    onEdit: (nextholder: NextholderDto) => void;
}

export const NextholderList: React.FC<NextholderListProps> = ({ onEdit }) => {
    const [nextholders, setNextholders] = useState<NextholderDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNextholders();
    }, []);

    const loadNextholders = async () => {
        setLoading(true);
        try {
            const data = await nextholderService.getNextholders();
            setNextholders(data);
        } catch (err: any) {
            toast.error('Failed to load nextholders');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this nextholder?')) return;

        try {
            await nextholderService.deleteNextholder(id);
            toast.success('Nextholder deleted successfully');
            loadNextholders();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete nextholder');
        }
    };

    if (loading) return <div>Loading nextholders...</div>;

    if (nextholders.length === 0) {
        return (
            <div className="nextholder-card" style={{ textAlign: 'center', padding: '40px' }}>
                <p>No nextholders found. Add your family members or beneficiaries.</p>
            </div>
        );
    }

    return (
        <div className="nextholder-list">
            <div className="nextholder-grid">
                {nextholders.map(nextholder => (
                    <div key={nextholder.id} className="nextholder-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h3 style={{ border: 'none', margin: 0 }}>
                                {nextholder.firstName} {nextholder.lastName}
                            </h3>
                            <span style={{
                                background: '#eef2f7',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#555'
                            }}>
                                {nextholder.relationship}
                            </span>
                        </div>

                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                            <p style={{ margin: '5px 0' }}>DOB: {new Date(nextholder.dateOfBirth).toLocaleDateString()}</p>
                            {nextholder.email && <p style={{ margin: '5px 0' }}>Email: {nextholder.email}</p>}
                            {nextholder.mobile && <p style={{ margin: '5px 0' }}>Mobile: {nextholder.mobile}</p>}
                            {nextholder.isMinor && (
                                <p style={{ margin: '5px 0', color: '#e67e22' }}>
                                    Minor (Guardian: {nextholder.guardianName})
                                </p>
                            )}
                        </div>

                        <div className="actions-cell">
                            <button
                                className="btn-secondary"
                                onClick={() => onEdit(nextholder)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn-danger"
                                onClick={() => nextholder.id && handleDelete(nextholder.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
