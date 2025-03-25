
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { groceryApi, friendsApi } from '@/services/api';

// Define the Category type
export type Category = 'All' | 'Produce' | 'Dairy' | 'Bakery' | 'Meat' | 'Frozen' | 'Pantry' | 'Other';

// Define the GroceryItem type with additional price property
export interface GroceryItem {
  id: string;
  name: string;
  category: Exclude<Category, 'All'>;
  completed: boolean;
  price: number;
  created_at: string;
  user_id: string;
}

// Define the Friend type with optional email property
export interface Friend {
  id: string;
  username: string;
  avatarUrl: string;
  email?: string; // Add optional email property
}

// Define the context type
interface GroceryContextType {
  items: GroceryItem[];
  filteredItems: GroceryItem[];
  selectedCategory: Category;
  friends: Friend[];
  addItem: (name: string, category: Exclude<Category, 'All'>, price: number) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  editItem: (id: string, name: string, category: Exclude<Category, 'All'>, price: number) => Promise<void>;
  setSelectedCategory: (category: Category) => void;
  clearCompletedItems: () => Promise<void>;
  addFriend: (friend: Friend) => Promise<void>;
  removeFriend: (id: string) => Promise<void>;
  loading: boolean;
}

// Get items from localStorage
const getItemsFromStorage = (userId: string): GroceryItem[] => {
  const storageKey = `groceryItems_${userId}`;
  const storedItems = localStorage.getItem(storageKey);
  return storedItems ? JSON.parse(storedItems) : [];
};

// Save items to localStorage
const saveItemsToStorage = (userId: string, items: GroceryItem[]) => {
  const storageKey = `groceryItems_${userId}`;
  localStorage.setItem(storageKey, JSON.stringify(items));
};

// Get friends from localStorage
const getFriendsFromStorage = (userId: string): Friend[] => {
  const storageKey = `groceryFriends_${userId}`;
  const storedFriends = localStorage.getItem(storageKey);
  return storedFriends ? JSON.parse(storedFriends) : [];
};

// Save friends to localStorage
const saveFriendsToStorage = (userId: string, friends: Friend[]) => {
  const storageKey = `groceryFriends_${userId}`;
  localStorage.setItem(storageKey, JSON.stringify(friends));
};

// Create the context
const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

// Custom hook to use the grocery context
export const useGrocery = () => {
  const context = useContext(GroceryContext);
  if (context === undefined) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
};

// GroceryProvider component
export const GroceryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [loading, setLoading] = useState(true);
  const { user, findUserByUsername, findUserByEmail, getAllUsers } = useAuth();

  // Compute filtered items based on selected category
  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category === selectedCategory);

  // Initialize or fetch data when user changes
  useEffect(() => {
    if (user?.isLoggedIn) {
      fetchGroceryItems();
      fetchFriends();
    } else {
      setItems([]);
      setFriends([]);
    }
  }, [user]);

  // Fetch grocery items
  const fetchGroceryItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Make an API call to the backend for items
      const response = await groceryApi.getItems(user.id);
      
      // If the API call fails, fall back to localStorage
      if (!response.success) {
        console.warn("Failed to fetch items from API, falling back to localStorage");
        const userItems = getItemsFromStorage(user.id);
        setItems(userItems);
        return;
      }
      
      // If we got data from the API but it's empty, use localStorage
      if (!response.data || response.data.length === 0) {
        const userItems = getItemsFromStorage(user.id);
        setItems(userItems);
      } else {
        setItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching grocery items:', error);
      toast.error('Failed to load your grocery items');
      
      // Fallback to localStorage
      const userItems = getItemsFromStorage(user.id);
      setItems(userItems);
    } finally {
      setLoading(false);
    }
  };

  // Fetch friends
  const fetchFriends = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Make an API call to the backend for friends
      const response = await friendsApi.getFriends(user.id);
      
      // If the API call fails, fall back to localStorage
      if (!response.success) {
        console.warn("Failed to fetch friends from API, falling back to localStorage");
        const userFriends = getFriendsFromStorage(user.id);
        setFriends(userFriends);
        return;
      }
      
      // If we got data from the API but it's empty, use localStorage
      if (!response.data || response.data.length === 0) {
        const userFriends = getFriendsFromStorage(user.id);
        setFriends(userFriends);
      } else {
        setFriends(response.data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load your friends');
      
      // Fallback to localStorage
      const userFriends = getFriendsFromStorage(user.id);
      setFriends(userFriends);
    } finally {
      setLoading(false);
    }
  };

  // Add item
  const addItem = async (name: string, category: Exclude<Category, 'All'>, price: number) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const newItem: GroceryItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        category,
        completed: false,
        price,
        created_at: new Date().toISOString(),
        user_id: user.id
      };
      
      // Make an API call to the backend
      const response = await groceryApi.addItem(user.id, newItem);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to add item on server");
      }
      
      // Update local state
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      
      // Update storage (local cache)
      saveItemsToStorage(user.id, updatedItems);
      
      toast.success(`Added ${name} to your list`);
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast.error(error.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  // Toggle item
  const toggleItem = async (id: string) => {
    if (!user) return;
    
    try {
      const item = items.find(item => item.id === id);
      if (!item) return;
      
      // Update local state
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      
      setItems(updatedItems);
      
      // Update storage
      saveItemsToStorage(user.id, updatedItems);
      
      // Make an API call to the backend
      const response = await groceryApi.updateItem(user.id, id, { 
        ...item, 
        completed: !item.completed 
      });
      
      if (!response.success) {
        console.warn("Failed to update item on server, but updated locally");
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Failed to update item');
    }
  };

  // Delete item
  const deleteItem = async (id: string) => {
    if (!user) return;
    
    try {
      // Update local state
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      
      // Update storage
      saveItemsToStorage(user.id, updatedItems);
      
      // Make an API call to the backend
      const response = await groceryApi.deleteItem(user.id, id);
      
      if (!response.success) {
        console.warn("Failed to delete item on server, but deleted locally");
      }
      
      toast.info('Item removed from your list');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  // Edit item
  const editItem = async (id: string, name: string, category: Exclude<Category, 'All'>, price: number) => {
    if (!user) return;
    
    try {
      const item = items.find(item => item.id === id);
      if (!item) return;
      
      // Create updated item
      const updatedItem = { 
        ...item, 
        name, 
        category, 
        price 
      };
      
      // Update local state
      const updatedItems = items.map(item =>
        item.id === id ? updatedItem : item
      );
      
      setItems(updatedItems);
      
      // Update storage
      saveItemsToStorage(user.id, updatedItems);
      
      // Make an API call to the backend
      const response = await groceryApi.updateItem(user.id, id, updatedItem);
      
      if (!response.success) {
        console.warn("Failed to update item on server, but updated locally");
      }
      
      toast.success(`Updated ${name}`);
    } catch (error) {
      console.error('Error editing item:', error);
      toast.error('Failed to update item');
    }
  };

  // Clear completed items
  const clearCompletedItems = async () => {
    if (!user) return;
    
    try {
      const completedItems = items.filter(item => item.completed);
      
      if (completedItems.length === 0) return;
      
      // Update local state
      const updatedItems = items.filter(item => !item.completed);
      setItems(updatedItems);
      
      // Update storage
      saveItemsToStorage(user.id, updatedItems);
      
      // Make API calls to delete each completed item
      const deletePromises = completedItems.map(item => 
        groceryApi.deleteItem(user.id, item.id)
      );
      
      await Promise.allSettled(deletePromises);
      
      toast.info('Cleared completed items');
    } catch (error) {
      console.error('Error clearing completed items:', error);
      toast.error('Failed to clear completed items');
    }
  };

  // Add friend
  const addFriend = async (friend: Friend) => {
    if (!user) return;
    
    try {
      // Check if already friends
      const isFriend = friends.some(f => f.id === friend.id);
      
      if (isFriend) {
        toast.error('You are already friends with this user');
        return;
      }
      
      // Make sure the friend exists in the system
      let foundUser = findUserByUsername(friend.username);
      
      if (!foundUser && friend.email) {
        // If username lookup fails, try email
        foundUser = findUserByEmail(friend.email);
      }
      
      if (!foundUser && friend.id) {
        // If all lookups fail but we have an ID, check all users
        const allUsers = getAllUsers();
        foundUser = allUsers.find(u => u.id === friend.id);
      }
      
      if (!foundUser) {
        toast.error(`User "${friend.username}" does not exist`);
        return;
      }
      
      // Don't allow adding yourself
      if (foundUser.id === user.id) {
        toast.error("You cannot add yourself as a friend");
        return;
      }
      
      // Generate friend object with consistent data
      const newFriend: Friend = {
        id: foundUser.id,
        username: foundUser.username,
        avatarUrl: foundUser.avatarUrl,
        email: foundUser.email // Include email if available
      };
      
      // Make an API call to the backend
      const response = await friendsApi.addFriend(user.id, newFriend);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to add friend on server");
      }
      
      // Update local state
      const updatedFriends = [...friends, newFriend];
      setFriends(updatedFriends);
      
      // Update storage
      saveFriendsToStorage(user.id, updatedFriends);
      
      toast.success(`${newFriend.username} added to your friends list!`);
    } catch (error: any) {
      console.error('Error adding friend:', error);
      toast.error(error.message || 'Failed to add friend');
    }
  };

  // Remove friend
  const removeFriend = async (id: string) => {
    if (!user) return;
    
    try {
      const friend = friends.find(f => f.id === id);
      if (!friend) return;
      
      // Update local state
      const updatedFriends = friends.filter(f => f.id !== id);
      setFriends(updatedFriends);
      
      // Update storage
      saveFriendsToStorage(user.id, updatedFriends);
      
      // Make an API call to the backend
      const response = await friendsApi.removeFriend(user.id, id);
      
      if (!response.success) {
        console.warn("Failed to remove friend on server, but removed locally");
      }
      
      toast.info(`${friend.username} removed from your friends list`);
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  return (
    <GroceryContext.Provider
      value={{
        items,
        filteredItems,
        selectedCategory,
        friends,
        addItem,
        toggleItem,
        deleteItem,
        editItem,
        setSelectedCategory,
        clearCompletedItems,
        addFriend,
        removeFriend,
        loading
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
};
