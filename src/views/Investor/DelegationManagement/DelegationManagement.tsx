import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { serviceAgentService, DelegationDto } from '../../../services/serviceAgent.service';
import { delegationService } from '../../../services/delegation.service';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import PostLoginHeader from '../../../components/PostLoginHeader/PostLoginHeader';
import { AcceptDelegationModal, ConsentCustomization } from '../../../components/AcceptDelegationModal/AcceptDelegationModal';
import './DelegationManagement.scss';

const SCOPE_LABELS: Record<string, string> = {
  FULL_ONBOARDING: 'Full Onboarding Access',
  CKYC_ONLY:       'CKYC Only',
  ONBOARDING_ONLY: 'Onboarding Only',
  VIEW_ONLY:       'View Only',
};

export const DelegationManagement: React.FC = () => {
  const [delegations, setDelegations] = useState<DelegationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState<DelegationDto | null>(null);
  const [modalMode, setModalMode] = useState<'accept' | 'edit'>('accept');

  useEffect(() => {
    fetchDelegations();
  }, []);

  const fetchDelegations = async () => {
    try {
      const data = await serviceAgentService.getMyDelegations();
      console.log('[DelegationManagement] Received delegations from API:', data);
      setDelegations(data);
    } catch {
      toast.error('Failed to load delegations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAcceptModal = (delegation: DelegationDto) => {
    setSelectedDelegation(delegation);
    setModalMode('accept');
    setShowAcceptModal(true);
  };

  const handleOpenEditModal = (delegation: DelegationDto) => {
    setSelectedDelegation(delegation);
    setModalMode('edit');
    setShowAcceptModal(true);
  };

  const handleAccept = async (delegationId: number, customizations: ConsentCustomization) => {
    setProcessing(delegationId);
    try {
      if (modalMode === 'edit') {
        await delegationService.updateDelegation(delegationId, customizations);
        toast.success('Service Agent permissions updated successfully');
      } else {
        await delegationService.acceptDelegation(delegationId, customizations);
        toast.success('Service Agent access accepted with your custom permissions');
      }
      setShowAcceptModal(false);
      fetchDelegations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${modalMode === 'edit' ? 'update' : 'accept'} delegation`);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (delegation: DelegationDto) => {
    if (!globalThis.confirm(`Reject assignment from ${delegation.serviceAgentName}?`)) return;
    setProcessing(delegation.id);
    try {
      await delegationService.rejectDelegation(delegation.id, 'Declined by investor');
      toast.info(`Assignment rejected: ${delegation.serviceAgentName}`);
      fetchDelegations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reject delegation');
    } finally {
      setProcessing(null);
    }
  };

  const handleRevoke = async (delegation: DelegationDto) => {
    if (!globalThis.confirm(`Revoke access for ${delegation.serviceAgentName}? They will immediately lose access to your account.`)) return;
    setProcessing(delegation.id);
    try {
      await serviceAgentService.revokeDelegation(delegation.id);
      toast.success('Delegation revoked successfully');
      fetchDelegations();
    } catch {
      toast.error('Failed to revoke delegation');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  const pending = delegations.filter(d => d.status === 'PENDING');
  const active   = delegations.filter(d => d.isActive && d.status === 'ACTIVE');
  const rejected = delegations.filter(d => d.status === 'REJECTED');
  const revoked = delegations.filter(d => d.status === 'REVOKED');

  return (
    <div className="layout-wrapper">
      <PostLoginHeader />
      <div className="main-content">
        <div className="delegation-management">
          <div className="delegation-management__header">
            <h2>Service Agent Access</h2>
            <p className="text-muted">Service Agents are assigned by your Service Provider. You can accept, reject, or revoke access here.</p>
          </div>

          {delegations.length === 0 && (
            <div className="delegation-management__empty">
              <p>No Service Agent assignments yet.</p>
              <p className="text-muted small">Your Service Provider will assign a Service Agent to assist with your onboarding.</p>
            </div>
          )}

          {pending.length > 0 && (
            <>
              <h5 className="mb-3 text-warning">⏳ Pending - Awaiting Your Response ({pending.length})</h5>
              <p className="small text-muted mb-3">These Service Agents have been assigned by your Service Provider. Review and customize permissions before accepting.</p>
              {pending.map(d => <DelegationCard key={d.id} delegation={d} onOpenAccept={handleOpenAcceptModal} onOpenEdit={handleOpenEditModal} onReject={handleReject} onRevoke={handleRevoke} processing={processing} />)}
            </>
          )}

          {active.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3 text-success">✓ Active ({active.length})</h5>
              {active.map(d => <DelegationCard key={d.id} delegation={d} onOpenAccept={handleOpenAcceptModal} onOpenEdit={handleOpenEditModal} onReject={handleReject} onRevoke={handleRevoke} processing={processing} />)}
            </div>
          )}

          {revoked.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3 text-secondary">🚫 Revoked ({revoked.length})</h5>
              {revoked.map(d => <DelegationCard key={d.id} delegation={d} onOpenAccept={handleOpenAcceptModal} onOpenEdit={handleOpenEditModal} onReject={handleReject} onRevoke={handleRevoke} processing={processing} />)}
            </div>
          )}

          {rejected.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3 text-danger">✗ Rejected ({rejected.length})</h5>
              {rejected.map(d => <DelegationCard key={d.id} delegation={d} onOpenAccept={handleOpenAcceptModal} onOpenEdit={handleOpenEditModal} onReject={handleReject} onRevoke={handleRevoke} processing={processing} />)}
            </div>
          )}
        </div>
      </div>

      {selectedDelegation && (
        <AcceptDelegationModal
          delegation={selectedDelegation}
          show={showAcceptModal}
          onClose={() => setShowAcceptModal(false)}
          onAccept={handleAccept}
          processing={processing === selectedDelegation.id}
          mode={modalMode}
        />
      )}
    </div>
  );
};

interface CardProps {
  delegation: DelegationDto;
  onOpenAccept: (d: DelegationDto) => void;
  onOpenEdit: (d: DelegationDto) => void;
  onReject: (d: DelegationDto) => void;
  onRevoke: (d: DelegationDto) => void;
  processing: number | null;
}

const DelegationCard: React.FC<CardProps> = ({ delegation: d, onOpenAccept, onOpenEdit, onReject, onRevoke, processing }) => {
  const isPending = d.status === 'PENDING';
  const isRejected = d.status === 'REJECTED';
  const isRevoked = d.status === 'REVOKED';

  return (
    <div className={`delegation-card ${isPending ? 'delegation-card--pending' : ''}`}>
      <div className="delegation-card__top">
        <div>
          <div className="delegation-card__agent">{d.serviceAgentName || 'Service Agent'}</div>
          <div className="delegation-card__code">Code: {d.serviceAgentCode}</div>
          {d.serviceAgentEmail && <div className="delegation-card__email text-muted small">{d.serviceAgentEmail}</div>}
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className={`scope-badge scope-badge--${d.scope}`}>
            {SCOPE_LABELS[d.scope] || d.scope}
          </span>
          {isPending && <span className="badge bg-warning">Pending</span>}
          {isRejected && <span className="badge bg-danger">Rejected</span>}
          {isRevoked && <span className="badge bg-secondary">Revoked</span>}
          {d.isActive && !isPending && <span className="badge bg-success">Active</span>}
        </div>
      </div>

      <div className="delegation-card__body">
        <div className="delegation-card__field">
          <div className="label">Can View</div>
          <div className="value">{d.canViewProfile ? '✅ Yes' : '❌ No'}</div>
        </div>
        <div className="delegation-card__field">
          <div className="label">Can Edit KYC</div>
          <div className="value">{d.canEditKyc ? '✅ Yes' : '❌ No'}</div>
        </div>
        <div className="delegation-card__field">
          <div className="label">Can Upload Docs</div>
          <div className="value">{d.canUploadDocuments ? '✅ Yes' : '❌ No'}</div>
        </div>
        <div className="delegation-card__field">
          <div className="label">Can Submit Forms</div>
          <div className="value">{d.canSubmitForms ? '✅ Yes' : '❌ No'}</div>
        </div>
        <div className="delegation-card__field">
          <div className="label">Valid From</div>
          <div className="value">{d.validFrom ? new Date(d.validFrom).toLocaleDateString() : 'Immediately'}</div>
        </div>
        <div className="delegation-card__field">
          <div className="label">Valid Until</div>
          <div className="value">{d.validTo ? new Date(d.validTo).toLocaleDateString() : 'No expiry'}</div>
        </div>
      </div>

      {d.notes && (
        <div className="delegation-card__notes">
          <strong>Notes:</strong> {d.notes}
        </div>
      )}

      {isPending && (
        <div className="delegation-card__footer">
          <p className="small text-muted mb-2">Review and customize the scope and permissions before accepting.</p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-success flex-fill"
              onClick={() => onOpenAccept(d)}
              disabled={processing === d.id}
            >
              {processing === d.id ? 'Processing...' : '✓ Review & Accept'}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => onReject(d)}
              disabled={processing === d.id}
            >
              ✗ Reject
            </button>
          </div>
        </div>
      )}

      {d.isActive && !isPending && (
        <div className="delegation-card__footer">
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary flex-fill"
              onClick={() => onOpenEdit(d)}
              disabled={processing === d.id}
            >
              ✏️ Edit Permissions
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onRevoke(d)}
              disabled={processing === d.id}
            >
              {processing === d.id ? 'Revoking...' : 'Revoke Access'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelegationManagement;
