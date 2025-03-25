
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, LogOut } from 'lucide-react';
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  avatarUrl: string;
  isLoggedIn: boolean;
}

interface InstagramAuthProps {
  onLogin: (user: User) => void;
  onLogout: () => void;
  currentUser: User | null;
}

// This is a simulated Instagram auth component (in a real app, you'd use OAuth)
const InstagramAuth: React.FC<InstagramAuthProps> = ({ onLogin, onLogout, currentUser }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [username, setUsername] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    setIsLoggingIn(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const user: User = {
        id: crypto.randomUUID(),
        username: username,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
        isLoggedIn: true
      };
      
      onLogin(user);
      setIsLoggingIn(false);
      setUsername('');
      toast.success(`Welcome, ${username}!`);
    }, 1500);
  };

  const handleLogout = () => {
    onLogout();
    toast.info("You've been logged out");
  };

  if (currentUser?.isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between p-4 glass rounded-xl mb-6"
      >
        <div className="flex items-center gap-3">
          <img 
            src={currentUser.avatarUrl} 
            alt={currentUser.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">{currentUser.username}</p>
            <p className="text-xs text-muted-foreground">Logged in with Instagram</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-xl mb-6"
    >
      <form onSubmit={handleLogin}>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#E1306C]">
            <Instagram size={24} />
            <h3 className="font-semibold text-xl">Login with Instagram</h3>
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg border border-input bg-background/50 focus:outline-none focus:ring-1 focus:ring-[#E1306C]"
              placeholder="Enter your Instagram username"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-[#405DE6] via-[#5851DB] to-[#E1306C] text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium"
          >
            {isLoggingIn ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Instagram size={18} />
                Continue with Instagram
              </>
            )}
          </button>
          
          <p className="text-xs text-center text-muted-foreground">
            This is a simulated login for demo purposes.
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default InstagramAuth;
