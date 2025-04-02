
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Use useEffect to prevent render loops
  useEffect(() => {
    // Only navigate if authentication state is determined
    if (isAuthenticated !== undefined) {
      navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Return null to avoid rendering anything
  return null;
};

export default Index;
