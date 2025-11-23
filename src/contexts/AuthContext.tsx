import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const autoSignIn = async () => {
    const testEmail = "test@nudge.app";
    const testPassword = "testpassword123";

    try {
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError && signInError.message.includes("Invalid login credentials")) {
        // If sign in fails, sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: "testuser",
              display_name: "Test User",
            },
          },
        });

        if (signUpError) {
          console.error("Auto sign up error:", signUpError);
          toast({
            variant: "destructive",
            title: "Auto-login failed",
            description: signUpError.message,
          });
          return;
        }

        setSession(signUpData.session);
        setUser(signUpData.user);

        // Create profile if it doesn't exist
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              user_id: signUpData.user.id,
              username: "testuser",
              display_name: "Test User",
              bio: "Testing Nudge features",
            });

          if (profileError && !profileError.message.includes("duplicate")) {
            console.error("Profile creation error:", profileError);
          }
        }
      } else if (signInError) {
        console.error("Auto sign in error:", signInError);
        toast({
          variant: "destructive",
          title: "Auto-login failed",
          description: signInError.message,
        });
      } else {
        setSession(signInData.session);
        setUser(signInData.user);
      }
    } catch (error) {
      console.error("Auto-login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session with timeout and error handling
    let loadingComplete = false;
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (session) {
          setSession(session);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        loadingComplete = true;
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!loadingComplete) {
        console.warn('Auth check timed out, setting loading to false');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    checkSession();

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
