import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              username: email.split('@')[0],
              display_name: email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Account created! ✨",
            description: "Please check your email to verify your account, or continue to set up your profile.",
          });
          
          // Check if profile was auto-created by trigger
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          // Navigate to onboarding for new users
          navigate('/weekday-time');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Welcome back! 👋",
            description: "Redirecting to your dashboard...",
          });
          
          // Check if user has completed onboarding (has classes)
          const { data: classes } = await supabase
            .from('classes')
            .select('id')
            .eq('user_id', data.user.id)
            .limit(1);

          if (classes && classes.length > 0) {
            navigate('/dashboard');
          } else {
            // New user, go to onboarding
            navigate('/weekday-time');
          }
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isSignUp ? "Sign up failed" : "Sign in failed",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-30" />
      
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-block">
            <h1 className="text-5xl font-black text-gradient-primary mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground font-medium">
            {isSignUp ? 'Sign up to start your study journey' : 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 text-base"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-semibold">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isSignUp ? "At least 6 characters" : "Enter your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-14 text-base"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold bg-gradient-primary hover:opacity-90 transition-all hover-scale glow-primary rounded-3xl"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            disabled={loading}
          >
            {isSignUp ? (
              <>Already have an account? <span className="text-primary font-semibold">Sign in</span></>
            ) : (
              <>Don't have an account? <span className="text-primary font-semibold">Sign up</span></>
            )}
          </button>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 text-muted-foreground font-semibold">Or</span>
          </div>
        </div>

        <Button
          onClick={() => navigate('/account-setup')}
          className="w-full h-14 text-lg font-bold bg-card border-2 border-border hover:border-primary transition-all hover-scale rounded-3xl"
          variant="outline"
          disabled={loading}
        >
          <span className="flex items-center gap-3">
            ← Back to other options
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Login;

