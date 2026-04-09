import { useNavigate, useParams } from 'react-router-dom';
import { getSAProxyInvestorId } from '../services/saProxyAdapter';

/**
 * Hook for navigation that respects Service Agent proxy mode.
 * When in SA proxy mode, converts investor routes to SA proxy routes.
 */
export const useSAProxyNavigation = () => {
  const navigate = useNavigate();
  const { investorId } = useParams<{ investorId?: string }>();
  const proxyId = getSAProxyInvestorId();

  const navigateWithProxy = (investorPath: string) => {
    if (proxyId !== null && investorId) {
      // Convert /investor/xxx → /service-agent/investors/{id}/xxx
      const relativePath = investorPath.replace('/investor/', '');
      const saPath = `/service-agent/investors/${investorId}/${relativePath}`;
      console.log('[SAProxyNav] Redirecting:', investorPath, '→', saPath);
      navigate(saPath);
    } else {
      // Normal investor navigation
      navigate(investorPath);
    }
  };

  const isProxyMode = proxyId !== null;

  return {
    navigate: navigateWithProxy,
    isProxyMode,
    investorId: proxyId,
  };
};

export default useSAProxyNavigation;
