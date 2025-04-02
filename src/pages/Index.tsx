
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Use useEffect to prevent render loops
  useEffect(() => {
    // Only navigate if authentication state is determined and not loading
    if (!isLoading) {
      navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Return a loading indicator or null
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
};

export default Index;
