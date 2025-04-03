
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Add a small delay to ensure contexts are properly initialized
    const timer = setTimeout(() => {
      if (!isLoading) {
        // If authenticated, go to dashboard, otherwise to login
        navigate(isAuthenticated ? '/dashboard' : '/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated, isLoading]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg font-medium text-chawal-primary">Loading...</p>
    </div>
  );
};

export default Index;
