import { useParams, Navigate } from 'react-router-dom';

export function SAInvestorRedirect() {
  const { investorId } = useParams<{ investorId: string }>();
  return <Navigate to={`/service-agent/investors/${investorId}/profile`} replace />;
}

export default SAInvestorRedirect;
