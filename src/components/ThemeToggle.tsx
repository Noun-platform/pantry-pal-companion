
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
      className="relative overflow-hidden"
    >
      <div className="relative z-10">
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </div>
      
      {/* Animated background */}
      {theme === 'dark' && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Button>
  );
};

export default ThemeToggle;
