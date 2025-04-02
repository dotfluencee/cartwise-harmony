
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // If authenticated, go to dashboard, otherwise to login
      navigate(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [navigate, isAuthenticated, isLoading]);

  return null;
};

export default Index;
