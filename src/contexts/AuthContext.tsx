
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/firebase';
import { toast } from "sonner";
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  isLoggedIn: boolean;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up session listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        if (session?.user) {
          const supaUser = session.user;
          // Get or create the user profile
          await setupUserProfile(supaUser);
          
          const appUser: User = {
            id: supaUser.id,
            username: supaUser.email?.split('@')[0] || 'User',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(supaUser.email?.split('@')[0] || 'User')}&background=random`,
            isLoggedIn: true,
            email: supaUser.email
          };
          setUser(appUser);
          localStorage.setItem('groceryUser', JSON.stringify(appUser));
        } else {
          setUser(null);
          localStorage.removeItem('groceryUser');
        }
        setLoading(false);
      }
    );

    // Initial session check
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const supaUser = session.user;
        await setupUserProfile(supaUser);
        
        const appUser: User = {
          id: supaUser.id,
          username: supaUser.email?.split('@')[0] || 'User',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(supaUser.email?.split('@')[0] || 'User')}&background=random`,
          isLoggedIn: true,
          email: supaUser.email
        };
        setUser(appUser);
        localStorage.setItem('groceryUser', JSON.stringify(appUser));
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setup user profile in database
  const setupUserProfile = async (supaUser: SupabaseUser) => {
    try {
      // Check if user exists in profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supaUser.id)
        .single();
      
      // If user doesn't exist, create a new profile
      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: supaUser.id,
          username: supaUser.email?.split('@')[0] || 'User',
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(supaUser.email?.split('@')[0] || 'User')}&background=random`,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error setting up user profile:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success("Account created! Please check your email to confirm your registration.");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success("Login successful!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.info("You've been logged out");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
