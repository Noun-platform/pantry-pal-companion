
import { motion } from 'framer-motion';
import { useGrocery, Category } from '@/contexts/GroceryContext';
import { cn } from '@/lib/utils';

const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useGrocery();
  
  const categories: Category[] = [
    'All', 'Produce', 'Dairy', 'Bakery', 'Meat', 'Frozen', 'Pantry', 'Other'
  ];

  return (
    <div className="mb-6 overflow-x-auto scrollbar-none">
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex gap-2 pb-1"
      >
        {categories.map((category) => (
          <CategoryButton 
            key={category}
            category={category}
            isSelected={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          />
        ))}
      </motion.div>
    </div>
  );
};

interface CategoryButtonProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ category, isSelected, onClick }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "py-1.5 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
        isSelected 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      )}
    >
      {category}
    </motion.button>
  );
};

export default CategoryFilter;
