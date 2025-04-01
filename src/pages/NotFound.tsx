
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  React.useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-chawal-background">
      <div className="text-center max-w-md p-6">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-chawal-foreground">404</h1>
        <p className="text-xl text-chawal-muted mb-6">Oops! Page not found</p>
        <p className="mb-8 text-chawal-muted">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <Button asChild className="bg-chawal-primary hover:bg-chawal-secondary">
          <Link to="/login">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
