
import { motion } from 'framer-motion';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AddItemForm from '@/components/AddItemForm';
import CategoryFilter from '@/components/CategoryFilter';
import GroceryList from '@/components/GroceryList';
import InstagramAuth from '@/components/InstagramAuth';
import FriendsList from '@/components/FriendsList';
import ApiLogs from '@/components/ApiLogs';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

const GroceryApp = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
          <ShoppingCart size={28} className="text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Grocery List</h1>
        <p className="text-muted-foreground">Keep track of everything you need to buy</p>
        
        <Link to="/chat" className="inline-block mt-4">
          <Button variant="outline" className="gap-2">
            <MessageCircle size={16} />
            Ask About Calories
          </Button>
        </Link>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-xl mx-auto"
      >
        <InstagramAuth />
        
        {user?.isLoggedIn && <FriendsList />}
        
        {user?.isLoggedIn && (
          <>
            <AddItemForm />
            <CategoryFilter />
            <GroceryList />
          </>
        )}
      </motion.div>
      
      {/* API Logs component for debugging */}
      <ApiLogs />
    </div>
  );
};

// Index no longer needs to wrap with providers since they're now at the App level
const Index = () => {
  return <GroceryApp />;
};

export default Index;
