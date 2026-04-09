import React, { createContext, useContext, ReactNode } from 'react';

interface ProxyModeContextType {
  isProxyMode: boolean;
  hideHeaderFooter: boolean;
}

const ProxyModeContext = createContext<ProxyModeContextType>({
  isProxyMode: false,
  hideHeaderFooter: false,
});

export const useProxyMode = () => useContext(ProxyModeContext);

interface Props {
  children: ReactNode;
}

export const ProxyModeProvider: React.FC<Props> = ({ children }) => {
  return (
    <ProxyModeContext.Provider value={{ isProxyMode: true, hideHeaderFooter: true }}>
      {children}
    </ProxyModeContext.Provider>
  );
};
