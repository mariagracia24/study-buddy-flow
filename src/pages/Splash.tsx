import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Splash = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is already logged in, go to dashboard
    if (!loading && user) {
      navigate('/dashboard');
      return;
    }

    // Otherwise, show splash then go to account setup
    if (!loading && !user) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [navigate, user, loading]);

  // Show loading indicator if auth is still loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(207,100%,57%)] relative overflow-hidden">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(207,100%,57%)] relative overflow-hidden">
      {/* Blob shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[hsl(270,80%,60%)] rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(45,98%,70%)] rounded-full blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(25,95%,60%)] rounded-full blur-3xl opacity-60 -translate-x-1/2 translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[hsl(340,100%,70%)] rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2" />
      
      {/* Floating dots */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-[hsl(340,100%,70%)] rounded-full animate-float" />
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[hsl(45,98%,70%)] rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-[hsl(340,100%,70%)] rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-[hsl(45,98%,70%)] rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
      
      <div className="relative z-10 text-center animate-in fade-in duration-700">
        <h1 className="text-8xl md:text-9xl font-black text-white tracking-tight">
          Nudge
        </h1>
      </div>
    </div>
  );
};

export default Splash;
