
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "sonner";
import { userApi } from '@/services/api';

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
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  findUserByUsername: (username: string) => User | undefined;
  findUserByEmail: (email: string) => User | undefined;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock storage for user data
interface StoredUser {
  email: string;
  password: string;
  id: string;
  username: string;
  avatarUrl: string;
}

// App-wide key for localStorage
const USERS_STORAGE_KEY = 'groceryAppUsers';
const CURRENT_USER_KEY = 'groceryUser';

// Helper to persist users to localStorage
const saveUsersToStorage = (users: StoredUser[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Helper to get users from localStorage
const getUsersFromStorage = (): StoredUser[] => {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (storedUsers) {
    try {
      return JSON.parse(storedUsers);
    } catch (e) {
      console.error('Error parsing stored users:', e);
      return getDefaultUsers();
    }
  }
  return getDefaultUsers();
};

// Default users for new installs
const getDefaultUsers = (): StoredUser[] => {
  return [
    {
      email: "demo@example.com",
      password: "password123",
      id: "demo-user-1",
      username: "demouser",
      avatarUrl: `https://ui-avatars.com/api/?name=demouser&background=random`
    }
  ];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStorage, setUserStorage] = useState<StoredUser[]>([]);

  // Initialize user storage on mount
  useEffect(() => {
    const storedUsers = getUsersFromStorage();
    setUserStorage(storedUsers);
    
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Update localStorage when userStorage changes
  useEffect(() => {
    if (userStorage.length > 0) {
      saveUsersToStorage(userStorage);
    }
  }, [userStorage]);

  const findUserByUsername = (username: string): User | undefined => {
    const foundUser = userStorage.find(user => user.username.toLowerCase() === username.toLowerCase());
    if (!foundUser) return undefined;
    
    return {
      id: foundUser.id,
      username: foundUser.username,
      avatarUrl: foundUser.avatarUrl,
      isLoggedIn: true,
      email: foundUser.email
    };
  };

  const findUserByEmail = (email: string): User | undefined => {
    const foundUser = userStorage.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) return undefined;
    
    return {
      id: foundUser.id,
      username: foundUser.username,
      avatarUrl: foundUser.avatarUrl,
      isLoggedIn: true,
      email: foundUser.email
    };
  };

  const getAllUsers = (): User[] => {
    return userStorage.map(stored => ({
      id: stored.id,
      username: stored.username,
      avatarUrl: stored.avatarUrl,
      isLoggedIn: false,
      email: stored.email
    }));
  };

  const signUp = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      // Trim and sanitize inputs
      const trimmedUsername = username.trim();
      const trimmedEmail = email.trim().toLowerCase();
      
      // Check if user already exists
      const emailExists = userStorage.some(user => user.email.toLowerCase() === trimmedEmail);
      if (emailExists) {
        throw new Error("User with this email already exists");
      }
      
      const usernameExists = userStorage.some(user => user.username.toLowerCase() === trimmedUsername.toLowerCase());
      if (usernameExists) {
        throw new Error("Username is already taken");
      }
      
      // Create new user
      const newUser: StoredUser = {
        email: trimmedEmail,
        password,
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        username: trimmedUsername,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedUsername)}&background=random`
      };
      
      // Mock API call to backend
      const response = await userApi.signUp(trimmedUsername, trimmedEmail, password);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to register on server");
      }
      
      // Add to storage and update state
      const updatedUserStorage = [...userStorage, newUser];
      setUserStorage(updatedUserStorage);
      saveUsersToStorage(updatedUserStorage);
      
      // Create user object
      const appUser: User = {
        id: newUser.id,
        username: newUser.username,
        avatarUrl: newUser.avatarUrl,
        isLoggedIn: true,
        email: newUser.email
      };
      
      // Set user state
      setUser(appUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(appUser));
      
      toast.success("Account created successfully!");
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
      
      // Find user (case insensitive)
      const foundUser = userStorage.find(user => user.email.toLowerCase() === email.toLowerCase());
      if (!foundUser) {
        throw new Error("User not found");
      }
      
      // Check password
      if (foundUser.password !== password) {
        throw new Error("Invalid password");
      }
      
      // Mock API call to backend
      const response = await userApi.signIn(email, password);
      
      if (!response.success) {
        throw new Error(response.error || "Login failed on server");
      }
      
      // Create user object
      const appUser: User = {
        id: foundUser.id,
        username: foundUser.username,
        avatarUrl: foundUser.avatarUrl,
        isLoggedIn: true,
        email: foundUser.email
      };
      
      // Set user state
      setUser(appUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(appUser));
      
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
      
      // Mock API call to backend
      const response = await userApi.logout();
      
      if (!response.success) {
        console.warn("Logout failed on server, but proceeding with local logout");
      }
      
      setUser(null);
      localStorage.removeItem(CURRENT_USER_KEY);
      toast.info("You've been logged out");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signUp, 
      signIn, 
      logout, 
      findUserByUsername, 
      findUserByEmail, 
      getAllUsers 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
