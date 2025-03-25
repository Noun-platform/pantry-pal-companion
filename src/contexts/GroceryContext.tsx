
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export type Category = 'All' | 'Produce' | 'Dairy' | 'Bakery' | 'Meat' | 'Frozen' | 'Pantry' | 'Other';

export interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
  category: Exclude<Category, 'All'>;
  createdAt: number;
}

interface GroceryContextType {
  items: GroceryItem[];
  filteredItems: GroceryItem[];
  selectedCategory: Category;
  addItem: (name: string, category: Exclude<Category, 'All'>) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  editItem: (id: string, name: string, category: Exclude<Category, 'All'>) => void;
  setSelectedCategory: (category: Category) => void;
  clearCompletedItems: () => void;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export const useGrocery = () => {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
};

interface GroceryProviderProps {
  children: ReactNode;
}

export const GroceryProvider: React.FC<GroceryProviderProps> = ({ children }) => {
  const [items, setItems] = useState<GroceryItem[]>(() => {
    const savedItems = localStorage.getItem('groceryItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  useEffect(() => {
    localStorage.setItem('groceryItems', JSON.stringify(items));
  }, [items]);

  const addItem = (name: string, category: Exclude<Category, 'All'>) => {
    if (!name.trim()) return;
    
    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      completed: false,
      category,
      createdAt: Date.now(),
    };
    
    setItems(prev => [newItem, ...prev]);
    toast({
      description: "Item added to your list",
      duration: 2000,
    });
  };

  const toggleItem = (id: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, completed: !item.completed } 
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast({
      description: "Item removed from your list",
      duration: 2000,
    });
  };

  const editItem = (id: string, name: string, category: Exclude<Category, 'All'>) => {
    if (!name.trim()) return;
    
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, name: name.trim(), category } 
          : item
      )
    );
    
    toast({
      description: "Item updated",
      duration: 2000,
    });
  };

  const clearCompletedItems = () => {
    const completedCount = items.filter(item => item.completed).length;
    
    if (completedCount === 0) {
      toast({
        description: "No completed items to clear",
        duration: 2000,
      });
      return;
    }
    
    setItems(prev => prev.filter(item => !item.completed));
    
    toast({
      description: `Cleared ${completedCount} completed ${completedCount === 1 ? 'item' : 'items'}`,
      duration: 2000,
    });
  };

  return (
    <GroceryContext.Provider 
      value={{ 
        items, 
        filteredItems,
        selectedCategory,
        addItem, 
        toggleItem, 
        deleteItem, 
        editItem,
        setSelectedCategory,
        clearCompletedItems
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
};
