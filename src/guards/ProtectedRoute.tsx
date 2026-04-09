import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authenticationService } from '../services/authentication.service';
import { LoadingSpinner } from '../components/LoadingSpinner/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, isLoading, userRoles, checkAuth } = useAuth();
  const hasValidToken = authenticationService.isAuthorized();

  console.log('[ProtectedRoute] RENDER - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'hasValidToken:', hasValidToken);

  React.useEffect(() => {
    console.log('[ProtectedRoute] useEffect - isAuthenticated:', isAuthenticated, 'hasValidToken:', hasValidToken);
    
    if (!isAuthenticated && hasValidToken) {
      console.log('[ProtectedRoute] Token exists but context not updated, calling checkAuth()');
      checkAuth();
    }
  }, [isAuthenticated, hasValidToken, checkAuth]);

  if (isLoading || (!isAuthenticated && hasValidToken)) {
    console.log('[ProtectedRoute] Showing loading spinner - isLoading:', isLoading, 'waitingForAuth:', (!isAuthenticated && hasValidToken));
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));
    console.log('[ProtectedRoute] Role check - required:', requiredRoles, 'user has:', userRoles, 'hasAccess:', hasRequiredRole);
    if (!hasRequiredRole) {
      console.log('[ProtectedRoute] Insufficient permissions, redirecting to /unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('[ProtectedRoute] All checks passed, rendering children');
  return <>{children}</>;
};
