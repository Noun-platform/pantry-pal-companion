
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, User, X } from 'lucide-react';
import { Friend, useGrocery } from '@/contexts/GroceryContext';
import { toast } from "sonner";

const FriendsList: React.FC = () => {
  const { friends, addFriend, removeFriend } = useGrocery();
  const [isAdding, setIsAdding] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!friendUsername.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    // Check if friend already exists
    if (friends.some(f => f.username.toLowerCase() === friendUsername.toLowerCase())) {
      toast.error("This friend is already in your list");
      return;
    }
    
    const newFriend: Friend = {
      id: crypto.randomUUID(),
      username: friendUsername,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(friendUsername)}&background=random`,
    };
    
    addFriend(newFriend);
    setFriendUsername('');
    setIsAdding(false);
    toast.success(`${friendUsername} added to your friends list!`);
  };

  const handleRemoveFriend = (id: string, username: string) => {
    removeFriend(id);
    toast.info(`${username} removed from your friends list`);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Friends ({friends.length})</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center text-sm text-primary hover:underline"
          >
            <UserPlus size={16} className="mr-1" />
            Add Friend
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass p-3 rounded-xl mb-4"
            onSubmit={handleAddFriend}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Add Instagram Friend</h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-input bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Instagram username"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      
      {friends.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3"
        >
          <User size={40} className="text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">No friends yet</h3>
          <p className="text-muted-foreground">
            Add friends from Instagram to share your grocery lists
          </p>
        </motion.div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {friends.map(friend => (
              <motion.li
                key={friend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass flex items-center justify-between p-3 rounded-xl group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={friend.avatarUrl}
                    alt={friend.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{friend.username}</span>
                </div>
                <button
                  onClick={() => handleRemoveFriend(friend.id, friend.username)}
                  className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-600 transition-opacity"
                >
                  <X size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default FriendsList;
