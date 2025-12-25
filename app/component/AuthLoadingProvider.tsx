'use client';

import React from 'react';
import { useAuthContext } from '../../hooks/authHook';
import LoadingSpinner from './LoadingSpinner';

const AuthLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return <>{children}</>;
};

export default AuthLoadingProvider;