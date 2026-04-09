import React, { createContext, useContext } from 'react';

interface DelegationPermissions {
  isProxyMode: boolean;
  canViewProfile: boolean;
  canEditKyc: boolean;
  canUploadDocuments: boolean;
  canSubmitForms: boolean;
  scope: string;
}

const DelegationPermissionsContext = createContext<DelegationPermissions>({
  isProxyMode: false,
  canViewProfile: true,
  canEditKyc: true,
  canUploadDocuments: true,
  canSubmitForms: true,
  scope: 'FULL_ONBOARDING',
});

export const useDelegationPermissions = () => useContext(DelegationPermissionsContext);

export const DelegationPermissionsProvider: React.FC<{
  children: React.ReactNode;
  permissions: DelegationPermissions;
}> = ({ children, permissions }) => {
  return (
    <DelegationPermissionsContext.Provider value={permissions}>
      {children}
    </DelegationPermissionsContext.Provider>
  );
};
