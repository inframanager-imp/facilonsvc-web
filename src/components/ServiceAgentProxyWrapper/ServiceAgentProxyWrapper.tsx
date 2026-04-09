import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Spinner } from 'react-bootstrap';
import PostLoginHeader from '../PostLoginHeader/PostLoginHeader';
import DelegationBanner from '../DelegationBanner/DelegationBanner';
import { serviceAgentService } from '../../services/serviceAgent.service';
import { ServiceAgentInvestorDto } from '../../models/ServiceAgentDto';
import { setSAProxyMode } from '../../services/saProxyAdapter';
import { getPermissionErrorMessage } from '../../utils/apiClient';
import { DelegationPermissionsProvider } from '../../contexts/DelegationPermissionsContext';
import './ServiceAgentProxyWrapper.scss';

interface Props {
  children: React.ReactNode;
}

export const ServiceAgentProxyWrapper: React.FC<Props> = ({ children }) => {
  const { investorId } = useParams<{ investorId: string }>();
  const navigate = useNavigate();
  const id = Number(investorId);

  const [delegation, setDelegation] = useState<ServiceAgentInvestorDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDelegation();
    
    return () => {
      setSAProxyMode(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDelegation = async () => {
    try {
      const list = await serviceAgentService.getMyInvestors();
      const found = list.find(i => i.investorId === id);
      if (!found) {
        toast.error('No active delegation found for this investor.');
        navigate('/service-agent/investors');
        return;
      }
      setDelegation(found);
      setSAProxyMode(id);
    } catch (err: any) {
      const permissionError = getPermissionErrorMessage(err);
      if (permissionError) {
        toast.error(permissionError);
      } else {
        toast.error('Failed to load delegation.');
      }
      navigate('/service-agent/investors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="sa-proxy-wrapper">
        <PostLoginHeader />
        <div className="sa-proxy-wrapper__loading">
          <Spinner animation="border" variant="primary" />
          <p>Loading investor details...</p>
        </div>
      </div>
    );
  }

  if (!delegation) return null;

  const scope = delegation.delegationScope ?? delegation.scope ?? 'VIEW_ONLY';

  return (
    <DelegationPermissionsProvider
      permissions={{
        isProxyMode: true,
        canViewProfile: delegation.canViewProfile,
        canEditKyc: delegation.canEditKyc,
        canUploadDocuments: delegation.canUploadDocuments,
        canSubmitForms: delegation.canSubmitForms,
        scope,
      }}
    >
      <div className="sa-proxy-wrapper">
        <PostLoginHeader />
        <DelegationBanner
          investorName={delegation.investorName}
          investorEmail={delegation.investorEmail}
          scope={scope}
          canViewProfile={delegation.canViewProfile}
          canEditKyc={delegation.canEditKyc}
          canUploadDocuments={delegation.canUploadDocuments}
          canSubmitForms={delegation.canSubmitForms}
          validTo={delegation.validTo ?? undefined}
          backUrl="/service-agent/investors"
        />
        <div className="sa-proxy-wrapper__content">
          {children}
        </div>
      </div>
    </DelegationPermissionsProvider>
  );
};

export default ServiceAgentProxyWrapper;
