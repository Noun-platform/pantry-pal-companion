
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Pencil, Trash, X } from 'lucide-react';
import { useGrocery, Category, GroceryItem as GroceryItemType } from '@/contexts/GroceryContext';
import { cn } from '@/lib/utils';

interface GroceryItemProps {
  item: GroceryItemType;
}

const categoryColors: Record<Exclude<Category, 'All'>, string> = {
  'Produce': 'bg-green-100 text-green-800',
  'Dairy': 'bg-blue-100 text-blue-800',
  'Bakery': 'bg-yellow-100 text-yellow-800',
  'Meat': 'bg-red-100 text-red-800',
  'Frozen': 'bg-indigo-100 text-indigo-800',
  'Pantry': 'bg-amber-100 text-amber-800',
  'Other': 'bg-gray-100 text-gray-800'
};

const GroceryItem: React.FC<GroceryItemProps> = ({ item }) => {
  const { toggleItem, deleteItem, editItem } = useGrocery();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedCategory, setEditedCategory] = useState<Exclude<Category, 'All'>>(item.category);
  const [editedPrice, setEditedPrice] = useState(item.price.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  
  const categories: Exclude<Category, 'All'>[] = [
    'Produce', 'Dairy', 'Bakery', 'Meat', 'Frozen', 'Pantry', 'Other'
  ];

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(item.name);
    setEditedCategory(item.category);
    setEditedPrice(item.price.toString());
  };

  const handleSave = () => {
    const priceValue = parseFloat(editedPrice) || 0;
    editItem(item.id, editedName, editedCategory, priceValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(item.name);
    setEditedCategory(item.category);
    setEditedPrice(item.price.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Format price as currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(item.price);

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "glass px-4 py-3 rounded-xl mb-3 flex items-center gap-3 group",
        item.completed && "bg-opacity-50 text-muted-foreground"
      )}
    >
      {isEditing ? (
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-background/50 p-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Item name"
            />
            <button 
              onClick={handleSave}
              className="p-2 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Check size={18} />
            </button>
            <button 
              onClick={handleCancel}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value as Exclude<Category, 'All'>)}
              className="bg-background/50 p-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <input
              type="number"
              value={editedPrice}
              onChange={(e) => setEditedPrice(e.target.value)}
              className="bg-background/50 p-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Price"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={() => toggleItem(item.id)}
            className={cn(
              "flex-shrink-0 h-5 w-5 rounded border transition-all duration-200 flex items-center justify-center",
              item.completed ? "bg-primary border-primary" : "border-gray-300 bg-white"
            )}
          >
            <span className={cn(
              "text-white transition-transform",
              item.completed ? "scale-100" : "scale-0"
            )}>
              <Check size={12} />
            </span>
          </button>
          <div className="flex-1 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className={cn(
                "text-base font-medium transition-all duration-200",
                item.completed && "line-through text-muted-foreground"
              )}>
                {item.name}
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full inline-block",
                  categoryColors[item.category]
                )}>
                  {item.category}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {formattedPrice}
                </span>
              </div>
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleEdit}
                className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label="Edit item"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Delete item"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.li>
  );
};

export default GroceryItem;
