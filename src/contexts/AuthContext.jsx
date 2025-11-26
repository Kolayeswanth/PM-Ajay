import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// User roles
export const ROLES = {
  MINISTRY: 'ministry',
  STATE: 'state',
  DISTRICT: 'district',
  GP: 'gp',
  DEPARTMENT: 'department',
  CONTRACTOR: 'contractor',
  PUBLIC: 'public'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('pm_ajay_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (credentials) => {
    // Mock login - In production, this would call an API
    const mockUsers = {
      ministry: {
        id: 1,
        name: 'Ministry Admin',
        email: 'admin@mosje.gov.in',
        role: ROLES.MINISTRY,
        department: 'Ministry of Social Justice & Empowerment'
      },
      state: {
        id: 2,
        name: 'State Admin - Maharashtra',
        email: 'admin@maharashtra.gov.in',
        role: ROLES.STATE,
        state: 'Maharashtra',
        department: 'State Social Welfare Department'
      },
      district: {
        id: 3,
        name: 'District Collector - Pune',
        email: 'collector@pune.gov.in',
        role: ROLES.DISTRICT,
        state: 'Maharashtra',
        district: 'Pune',
        department: 'District Administration'
      },
      gp: {
        id: 4,
        name: 'GP Officer - Shirur',
        email: 'gp@shirur.gov.in',
        role: ROLES.GP,
        state: 'Maharashtra',
        district: 'Pune',
        block: 'Shirur',
        gp: 'Shirur Gram Panchayat'
      },
      department: {
        id: 5,
        name: 'PWD Engineer - Pune',
        email: 'pwd@pune.gov.in',
        role: ROLES.DEPARTMENT,
        state: 'Maharashtra',
        district: 'Pune',
        department: 'Public Works Department'
      },
      contractor: {
        id: 6,
        name: 'ABC Construction Pvt Ltd',
        email: 'contact@abcconstruction.com',
        role: ROLES.CONTRACTOR,
        state: 'Maharashtra',
        district: 'Pune',
        company: 'ABC Construction Pvt Ltd'
      },
      public: {
        id: 7,
        name: 'Public User',
        email: 'public@example.com',
        role: ROLES.PUBLIC
      }
    };

    const authenticatedUser = mockUsers[credentials.role] || mockUsers.public;
    setUser(authenticatedUser);
    localStorage.setItem('pm_ajay_user', JSON.stringify(authenticatedUser));
    return authenticatedUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pm_ajay_user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
