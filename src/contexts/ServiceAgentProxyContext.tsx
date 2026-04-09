import React, { createContext, useContext, ReactNode } from 'react';

interface ServiceAgentProxyContextType {
  isProxyMode: boolean;
  targetInvestorId: number | null;
}

const ServiceAgentProxyContext = createContext<ServiceAgentProxyContextType>({
  isProxyMode: false,
  targetInvestorId: null,
});

export const useServiceAgentProxy = () => useContext(ServiceAgentProxyContext);

interface Props {
  investorId: number;
  children: ReactNode;
}

export const ServiceAgentProxyProvider: React.FC<Props> = ({ investorId, children }) => {
  return (
    <ServiceAgentProxyContext.Provider value={{ isProxyMode: true, targetInvestorId: investorId }}>
      {children}
    </ServiceAgentProxyContext.Provider>
  );
};
