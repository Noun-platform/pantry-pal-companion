
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useGrocery, Category } from '@/contexts/GroceryContext';

const AddItemForm: React.FC = () => {
  const { addItem } = useGrocery();
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'All'>>('Other');
  const [price, setPrice] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const categories: Exclude<Category, 'All'>[] = [
    'Produce', 'Dairy', 'Bakery', 'Meat', 'Frozen', 'Pantry', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      const priceValue = parseFloat(price) || 0;
      addItem(itemName, category, priceValue);
      setItemName('');
      setCategory('Other');
      setPrice('');
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    }
  };

  return (
    <div className="mb-6">
      {!isExpanded && (
        <motion.button
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass glass-hover shadow-sm"
        >
          <Plus size={18} className="text-primary" />
          <span className="font-medium">Add Item</span>
        </motion.button>
      )}

      {isExpanded && (
        <motion.form
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="glass p-4 rounded-xl"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium mb-1">
                Item Name
              </label>
              <input
                id="itemName"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Add a new item..."
                className="w-full p-3 rounded-lg border border-input bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Exclude<Category, 'All'>)}
                  className="w-full p-3 rounded-lg border border-input bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-1">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full p-3 rounded-lg border border-input bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={18} />
                Add Item
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="py-2 px-4 rounded-lg border hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.form>
      )}
    </div>
  );
};

export default AddItemForm;
