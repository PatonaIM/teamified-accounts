import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { clientService } from '../services/clientService';
import type { Client } from '../types/client';

interface ClientContextType {
  selectedClient: Client | null;
  clients: Client[];
  isLoading: boolean;
  setSelectedClient: (client: Client | null) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const CLIENT_STORAGE_KEY = 'teamified_selected_client_id';

const getStoredClientId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem(CLIENT_STORAGE_KEY);
  } catch {
    return null;
  }
};

const isUserAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const token = localStorage.getItem('teamified_access_token');
    return !!token;
  } catch {
    return false;
  }
};

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [selectedClient, setSelectedClientState] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = isUserAuthenticated();
    setIsAuthenticated(authStatus);

    const interval = setInterval(() => {
      const newAuthStatus = isUserAuthenticated();
      if (newAuthStatus !== isAuthenticated) {
        setIsAuthenticated(newAuthStatus);
        if (!newAuthStatus) {
          setSelectedClientState(null);
          setClients([]);
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem(CLIENT_STORAGE_KEY);
            } catch (error) {
              console.error('Failed to clear client selection from localStorage:', error);
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadClients = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('[ClientContext] Loading clients...');
      const response = await clientService.getClients({ limit: 100 });
      console.log('[ClientContext] Clients loaded:', response);
      const clientsList = response.clients ?? [];
      setClients(clientsList);

      const storedClientId = getStoredClientId();
      if (storedClientId) {
        const storedClient = clientsList.find(c => c.id === storedClientId);
        if (storedClient) {
          console.log('[ClientContext] Restoring selected client:', storedClient);
          setSelectedClientState(storedClient);
        } else {
          console.log('[ClientContext] Stored client not found, clearing selection');
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem(CLIENT_STORAGE_KEY);
            } catch (error) {
              console.error('Failed to clear invalid client from localStorage:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('[ClientContext] Failed to load clients:', error);
      setClients([]);
    } finally {
      setIsLoading(false);
      console.log('[ClientContext] Client loading complete');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadClients();
    }
  }, [isAuthenticated, loadClients]);

  const setSelectedClient = useCallback((client: Client | null) => {
    console.log('[ClientContext] Setting selected client:', client);
    setSelectedClientState(client);

    if (typeof window !== 'undefined') {
      try {
        if (client) {
          localStorage.setItem(CLIENT_STORAGE_KEY, client.id);
        } else {
          localStorage.removeItem(CLIENT_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to save client selection to localStorage:', error);
      }
    }
  }, []);

  return (
    <ClientContext.Provider
      value={{
        selectedClient,
        clients,
        isLoading,
        setSelectedClient,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};
