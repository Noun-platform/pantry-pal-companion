
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

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

// Define the Friend type
export interface Friend {
  id: string;
  username: string;
  avatarUrl: string;
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

// Mock storage
const mockItems: Record<string, GroceryItem[]> = {};
const mockFriends: Record<string, Friend[]> = {};

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
  const { user } = useAuth();

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

  // Mock fetch grocery items
  const fetchGroceryItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Get items from mock storage or initialize
      const userItems = mockItems[user.id] || [];
      setItems(userItems);
    } catch (error) {
      console.error('Error fetching grocery items:', error);
      toast.error('Failed to load your grocery items');
    } finally {
      setLoading(false);
    }
  };

  // Mock fetch friends
  const fetchFriends = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Get friends from mock storage or initialize
      const userFriends = mockFriends[user.id] || [];
      setFriends(userFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load your friends');
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
      
      // Update local state
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      
      // Update mock storage
      mockItems[user.id] = updatedItems;
      
      toast.success(`Added ${name} to your list`);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
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
      
      // Update mock storage
      mockItems[user.id] = updatedItems;
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
      
      // Update mock storage
      mockItems[user.id] = updatedItems;
      
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
      // Update local state
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, name, category, price } : item
      );
      
      setItems(updatedItems);
      
      // Update mock storage
      mockItems[user.id] = updatedItems;
      
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
      
      // Update mock storage
      mockItems[user.id] = updatedItems;
      
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
      const isFriend = friends.some(f => f.username.toLowerCase() === friend.username.toLowerCase());
      
      if (isFriend) {
        toast.error('You are already friends with this user');
        return;
      }
      
      // Generate id if not provided
      const newFriend = {
        ...friend,
        id: friend.id || `friend-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };
      
      // Update local state
      const updatedFriends = [...friends, newFriend];
      setFriends(updatedFriends);
      
      // Update mock storage
      mockFriends[user.id] = updatedFriends;
      
      toast.success(`${newFriend.username} added to your friends list!`);
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Failed to add friend');
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
      
      // Update mock storage
      mockFriends[user.id] = updatedFriends;
      
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
