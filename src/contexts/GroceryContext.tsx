
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

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

  // Fetch grocery items when user changes
  useEffect(() => {
    if (user?.isLoggedIn) {
      fetchGroceryItems();
      fetchFriends();
    } else {
      setItems([]);
      setFriends([]);
    }
  }, [user]);

  // Fetch grocery items from Supabase
  const fetchGroceryItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching grocery items:', error);
      toast.error('Failed to load your grocery items');
    } finally {
      setLoading(false);
    }
  };

  // Fetch friends from Supabase
  const fetchFriends = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          friend_id,
          profiles:friend_id (
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        const mappedFriends: Friend[] = data.map(friend => ({
          id: friend.id,
          username: friend.profiles?.username || 'User',
          avatarUrl: friend.profiles?.avatar_url || `https://ui-avatars.com/api/?name=User&background=random`
        }));
        setFriends(mappedFriends);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load your friends');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new item
  const addItem = async (name: string, category: Exclude<Category, 'All'>, price: number) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const newItem = {
        name,
        category,
        completed: false,
        price,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('grocery_items')
        .insert(newItem)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setItems(prevItems => [data, ...prevItems]);
        toast.success(`Added ${name} to your list`);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle an item's completed status
  const toggleItem = async (id: string) => {
    if (!user) return;
    
    try {
      const item = items.find(item => item.id === id);
      if (!item) return;
      
      // Optimistic update
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
      
      const { error } = await supabase
        .from('grocery_items')
        .update({ completed: !item.completed })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        // Revert optimistic update on error
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
          )
        );
        throw error;
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Failed to update item');
    }
  };

  // Function to delete an item
  const deleteItem = async (id: string) => {
    if (!user) return;
    
    try {
      // Optimistic update
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        // Revert optimistic update on error
        fetchGroceryItems();
        throw error;
      }
      
      toast.info('Item removed from your list');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  // Function to edit an item
  const editItem = async (id: string, name: string, category: Exclude<Category, 'All'>, price: number) => {
    if (!user) return;
    
    try {
      // Optimistic update
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, name, category, price } : item
        )
      );
      
      const { error } = await supabase
        .from('grocery_items')
        .update({ name, category, price })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        // Revert optimistic update on error
        fetchGroceryItems();
        throw error;
      }
      
      toast.success(`Updated ${name}`);
    } catch (error) {
      console.error('Error editing item:', error);
      toast.error('Failed to update item');
    }
  };

  // Function to clear completed items
  const clearCompletedItems = async () => {
    if (!user) return;
    
    try {
      const completedItemIds = items
        .filter(item => item.completed)
        .map(item => item.id);
      
      if (completedItemIds.length === 0) return;
      
      // Optimistic update
      setItems(prevItems => prevItems.filter(item => !item.completed));
      
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .in('id', completedItemIds)
        .eq('user_id', user.id);
      
      if (error) {
        // Revert optimistic update on error
        fetchGroceryItems();
        throw error;
      }
      
      toast.info('Cleared completed items');
    } catch (error) {
      console.error('Error clearing completed items:', error);
      toast.error('Failed to clear completed items');
    }
  };

  // Function to add a friend
  const addFriend = async (friend: Friend) => {
    if (!user) return;
    
    try {
      // Search for the user by username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', friend.username)
        .limit(1)
        .single();
      
      if (userError && userError.code !== 'PGRST116') { // PGRST116 is the 'not found' error
        throw userError;
      }
      
      if (!userData) {
        toast.error(`User ${friend.username} not found`);
        return;
      }
      
      // Check if already friends
      const { data: existingFriend, error: checkError } = await supabase
        .from('friends')
        .select('id')
        .eq('user_id', user.id)
        .eq('friend_id', userData.id)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (existingFriend && existingFriend.length > 0) {
        toast.error('You are already friends with this user');
        return;
      }
      
      // Add friend
      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: userData.id
        })
        .select(`
          id,
          friend_id,
          profiles:friend_id (
            username,
            avatar_url
          )
        `)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newFriend: Friend = {
          id: data.id,
          username: data.profiles?.username || friend.username,
          avatarUrl: data.profiles?.avatar_url || friend.avatarUrl
        };
        
        setFriends(prevFriends => [...prevFriends, newFriend]);
        toast.success(`${newFriend.username} added to your friends list!`);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Failed to add friend');
    }
  };

  // Function to remove a friend
  const removeFriend = async (id: string) => {
    if (!user) return;
    
    try {
      const friend = friends.find(f => f.id === id);
      if (!friend) return;
      
      // Optimistic update
      setFriends(prevFriends => prevFriends.filter(f => f.id !== id));
      
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        // Revert optimistic update on error
        fetchFriends();
        throw error;
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
