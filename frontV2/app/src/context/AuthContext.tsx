import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User, AuthContextType, LoginResult, RegisterRequest } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer l'ID de l'organisation/prestataire selon le rôle
  const fetchEntityId = async (userId: number, role: string): Promise<{ organizationId?: number; prestataireId?: number }> => {
    try {
      if (role === 'ORG') {
        const response = await apiService.getApi().get(`/organization/me/organization`);
        if (response.data.success && response.data.data) {
          return { organizationId: response.data.data.id };
        }
      } else if (role === 'PRESTA') {
        const response = await apiService.getApi().get(`/prestataire/${userId}`);
        console.log('Réponse API prestataire:', response.data);
        if (response.data.success && response.data.data && response.data.data.prestataire) {
          return { prestataireId: response.data.data.prestataire.id };
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID de l\'entité:', error);
    }
    return {};
  };

  // Fonction pour initialiser l'utilisateur avec ses IDs d'entité
  const initializeUserWithEntityIds = async (baseUser: User): Promise<User> => {
    if (baseUser.role === 'ORG' || baseUser.role === 'PRESTA') {
      const entityIds = await fetchEntityId(baseUser.id, baseUser.role);
      return {
        ...baseUser,
        ...entityIds
      };
    }
    return baseUser;
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          
          // Si l'utilisateur n'a pas encore ses IDs d'entité, les récupérer
          let completeUser = parsedUser;
          if ((parsedUser.role === 'ORG' && !parsedUser.organizationId) || 
              (parsedUser.role === 'PRESTA' && !parsedUser.prestataireId)) {
            completeUser = await initializeUserWithEntityIds(parsedUser);
            // Mettre à jour le localStorage avec les nouvelles infos
            localStorage.setItem('user', JSON.stringify(completeUser));
          }

          setUser(completeUser);
          setToken(storedToken);
          apiService.setAuthToken(storedToken);
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de l\'auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const baseUser: User = {
          id: response.data.id,
          email: response.data.email,
          role: response.data.role
        };

        // Récupérer les IDs d'entité si nécessaire
        const completeUser = await initializeUserWithEntityIds(baseUser);

        setUser(completeUser);
        setToken(response.data.token);
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(completeUser));
        
        apiService.setAuthToken(response.data.token);
        
        return { success: true, user: completeUser };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      const response = await apiService.register(data);
      
      if (response.success && response.data) {
        const newUser: User = {
          id: response.data.id,
          email: response.data.email,
          role: response.data.role
        };

        setUser(newUser);
        setToken(response.data.token);
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        apiService.setAuthToken(response.data.token);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiService.clearAuthToken();
  };

  const updateUserRole = async (newToken: string, newRole: string, entityId?: number): Promise<void> => {
    if (user) {
      const updatedUser: User = { 
        ...user, 
        role: newRole,
        organizationId: newRole === 'ORG' ? entityId : undefined,
        prestataireId: newRole === 'PRESTA' ? entityId : undefined
      };
      
      setUser(updatedUser);
      setToken(newToken);
      
      // Mettre à jour le localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      apiService.setAuthToken(newToken);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateUserRole,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 