
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import { useGrocery } from '@/contexts/GroceryContext';
import GroceryItem from './GroceryItem';

const GroceryList: React.FC = () => {
  const { filteredItems, clearCompletedItems } = useGrocery();
  
  const completedItems = filteredItems.filter(item => item.completed);
  const pendingItems = filteredItems.filter(item => !item.completed);
  
  return (
    <div className="space-y-6">
      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass p-8 rounded-xl flex flex-col items-center justify-center text-center gap-3"
        >
          <ShoppingCart size={48} className="text-muted-foreground opacity-50" />
          <h3 className="text-xl font-medium">Your list is empty</h3>
          <p className="text-muted-foreground">
            Add some items to your grocery list
          </p>
        </motion.div>
      ) : (
        <>
          <div>
            {pendingItems.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-2"
              >
                <h3 className="text-lg font-medium mb-3">To Buy ({pendingItems.length})</h3>
                <ul>
                  <AnimatePresence initial={false}>
                    {pendingItems.map(item => (
                      <GroceryItem key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </ul>
              </motion.div>
            )}
            
            {completedItems.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Purchased ({completedItems.length})</h3>
                  <button
                    onClick={clearCompletedItems}
                    className="flex items-center text-sm text-primary hover:underline"
                  >
                    <Check size={16} className="mr-1" />
                    Clear completed
                  </button>
                </div>
                <ul className="opacity-80">
                  <AnimatePresence initial={false}>
                    {completedItems.map(item => (
                      <GroceryItem key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </ul>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GroceryList;
