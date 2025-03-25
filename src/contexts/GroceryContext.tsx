
import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the Category type
export type Category = 'All' | 'Produce' | 'Dairy' | 'Bakery' | 'Meat' | 'Frozen' | 'Pantry' | 'Other';

// Define the GroceryItem type with additional price property
export interface GroceryItem {
  id: string;
  name: string;
  category: Exclude<Category, 'All'>;
  completed: boolean;
  price: number; // Added price property
  createdAt: Date;
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
  friends: Friend[]; // Added friends array
  addItem: (name: string, category: Exclude<Category, 'All'>, price: number) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  editItem: (id: string, name: string, category: Exclude<Category, 'All'>, price: number) => void;
  setSelectedCategory: (category: Category) => void;
  clearCompletedItems: () => void;
  addFriend: (friend: Friend) => void; // Added addFriend function
  removeFriend: (id: string) => void; // Added removeFriend function
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
  // Initialize state from localStorage or with default values
  const [items, setItems] = useState<GroceryItem[]>(() => {
    const savedItems = localStorage.getItem('groceryItems');
    if (savedItems) {
      try {
        // Parse the stored items and ensure createdAt is a Date object
        return JSON.parse(savedItems).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          price: item.price || 0 // Ensure price exists for backward compatibility
        }));
      } catch (error) {
        console.error('Error parsing stored items:', error);
        return [];
      }
    }
    return [];
  });

  // Initialize friends from localStorage or with empty array
  const [friends, setFriends] = useState<Friend[]>(() => {
    const savedFriends = localStorage.getItem('groceryFriends');
    if (savedFriends) {
      try {
        return JSON.parse(savedFriends);
      } catch (error) {
        console.error('Error parsing stored friends:', error);
        return [];
      }
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  // Compute filtered items based on selected category
  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category === selectedCategory);

  // Save items to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('groceryItems', JSON.stringify(items));
  }, [items]);

  // Save friends to localStorage whenever friends change
  useEffect(() => {
    localStorage.setItem('groceryFriends', JSON.stringify(friends));
  }, [friends]);

  // Function to add a new item
  const addItem = (name: string, category: Exclude<Category, 'All'>, price: number) => {
    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name,
      category,
      completed: false,
      price, // Add price to new items
      createdAt: new Date()
    };
    setItems(prevItems => [newItem, ...prevItems]);
  };

  // Function to toggle an item's completed status
  const toggleItem = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Function to delete an item
  const deleteItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Function to edit an item
  const editItem = (id: string, name: string, category: Exclude<Category, 'All'>, price: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, name, category, price } : item
      )
    );
  };

  // Function to clear completed items
  const clearCompletedItems = () => {
    setItems(prevItems => prevItems.filter(item => !item.completed));
  };

  // Function to add a friend
  const addFriend = (friend: Friend) => {
    setFriends(prevFriends => [...prevFriends, friend]);
  };

  // Function to remove a friend
  const removeFriend = (id: string) => {
    setFriends(prevFriends => prevFriends.filter(friend => friend.id !== id));
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
        removeFriend
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
};
