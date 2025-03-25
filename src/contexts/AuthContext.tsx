
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "sonner";

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

// Helper to persist users to localStorage
const saveUsersToStorage = (users: StoredUser[]) => {
  localStorage.setItem('groceryAppUsers', JSON.stringify(users));
};

// Helper to get users from localStorage
const getUsersFromStorage = (): StoredUser[] => {
  const storedUsers = localStorage.getItem('groceryAppUsers');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
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
  const [userStorage, setUserStorage] = useState<StoredUser[]>(getUsersFromStorage());

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('groceryUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Update localStorage when userStorage changes
  useEffect(() => {
    saveUsersToStorage(userStorage);
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
      isLoggedIn: true,
      email: stored.email
    }));
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const userExists = userStorage.find(user => user.email === email);
      if (userExists) {
        throw new Error("User with this email already exists");
      }
      
      // Generate a unique username from email, checking for duplicates
      let baseUsername = email.split('@')[0];
      let username = baseUsername;
      let count = 1;
      
      while (userStorage.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        username = `${baseUsername}${count}`;
        count++;
      }
      
      // Create new user
      const newUser: StoredUser = {
        email,
        password,
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        username,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
      };
      
      // Add to mock storage and update state
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
      localStorage.setItem('groceryUser', JSON.stringify(appUser));
      
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
      
      // Find user
      const foundUser = userStorage.find(user => user.email === email);
      if (!foundUser) {
        throw new Error("User not found");
      }
      
      // Check password
      if (foundUser.password !== password) {
        throw new Error("Invalid password");
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
      localStorage.setItem('groceryUser', JSON.stringify(appUser));
      
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
      setUser(null);
      localStorage.removeItem('groceryUser');
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
