import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

/**
 * Laravel-compatible entry: GET /introduce-investor1/{encrypted-or-plain}
 * Forwards to the React introduced flow with the same path suffix.
 */
const IntroduceInvestor1Redirect: React.FC = () => {
  const { '*': rest } = useParams();
  const suffix = rest ?? '';
  const encoded = suffix
    .split('/')
    .filter((s) => s.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const to = encoded ? `/investor/introduced/start/${encoded}` : '/investor/register';
  return <Navigate to={to} replace />;
};

export default IntroduceInvestor1Redirect;
