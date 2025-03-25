
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { GroceryProvider } from '@/contexts/GroceryContext';
import AddItemForm from '@/components/AddItemForm';
import CategoryFilter from '@/components/CategoryFilter';
import GroceryList from '@/components/GroceryList';
import InstagramAuth from '@/components/InstagramAuth';
import FriendsList from '@/components/FriendsList';

interface User {
  id: string;
  username: string;
  avatarUrl: string;
  isLoggedIn: boolean;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('groceryUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('groceryUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('groceryUser');
    }
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <GroceryProvider>
      <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <ShoppingCart size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Grocery List</h1>
          <p className="text-muted-foreground">Keep track of everything you need to buy</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl mx-auto"
        >
          <InstagramAuth 
            onLogin={handleLogin} 
            onLogout={handleLogout} 
            currentUser={user} 
          />
          
          {user?.isLoggedIn && <FriendsList />}
          
          <AddItemForm />
          <CategoryFilter />
          <GroceryList />
        </motion.div>
      </div>
    </GroceryProvider>
  );
};

export default Index;
