
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, User, X, Search, Mail, Users } from 'lucide-react';
import { Friend, useGrocery } from '@/contexts/GroceryContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FriendsList: React.FC = () => {
  const { friends, addFriend, removeFriend, loading } = useGrocery();
  const { getAllUsers, user: currentUser, findUserByEmail, findUserByUsername } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchBy, setSearchBy] = useState<'username' | 'email'>('username');
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUserId) {
      // If a user is selected from the dropdown
      try {
        setSubmitting(true);
        const allUsers = getAllUsers();
        const foundUser = allUsers.find(u => u.id === selectedUserId);
        
        if (!foundUser) {
          toast.error("User not found");
          setSubmitting(false);
          return;
        }
        
        await addFriend({
          id: foundUser.id,
          username: foundUser.username,
          avatarUrl: foundUser.avatarUrl,
          email: foundUser.email
        });
        
        setSelectedUserId('');
        setIsAdding(false);
      } catch (error) {
        console.error('Error in form submission:', error);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    
    if (!searchInput.trim()) {
      toast.error(`Please enter a ${searchBy} or select a user from the dropdown`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Find user by email or username based on searchBy
      const foundUser = searchBy === 'email' 
        ? findUserByEmail(searchInput)
        : findUserByUsername(searchInput);
      
      if (!foundUser) {
        toast.error(`User with this ${searchBy} not found`);
        setSubmitting(false);
        return;
      }
      
      // Don't allow adding yourself
      if (foundUser.id === currentUser?.id) {
        toast.error("You cannot add yourself as a friend");
        setSubmitting(false);
        return;
      }
      
      await addFriend({
        id: foundUser.id,
        username: foundUser.username,
        avatarUrl: foundUser.avatarUrl,
        email: foundUser.email
      });
      
      setSearchInput('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFriend = async (id: string, username: string) => {
    await removeFriend(id);
  };

  // Get all available users that are not the current user and not already friends
  const getAvailableUsers = () => {
    const allUsers = getAllUsers();
    return allUsers.filter(u => 
      u.id !== currentUser?.id && 
      !friends.some(f => f.id === u.id)
    );
  };

  if (loading && friends.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Friends</h3>
        <div className="glass p-6 rounded-xl flex justify-center">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const availableUsers = getAvailableUsers();

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
                <h4 className="font-medium">Add Friend</h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* New Select User Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  <Users size={16} className="inline mr-2" />
                  Select User
                </label>
                <Select 
                  value={selectedUserId} 
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a user to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.length > 0 ? (
                      availableUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <img 
                              src={user.avatarUrl} 
                              alt={user.username} 
                              className="w-6 h-6 rounded-full"
                            />
                            <span>{user.username}</span>
                            {user.email && (
                              <span className="text-xs text-muted-foreground">
                                ({user.email})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        No available users to add
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center my-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="px-2 text-xs text-gray-500">OR</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground p-1 rounded-md hover:bg-gray-100">
                        {searchBy === 'username' ? <User size={16} /> : <Mail size={16} />}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setSearchBy('username')}>
                        <User size={16} className="mr-2" />
                        Search by Username
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSearchBy('email')}>
                        <Mail size={16} className="mr-2" />
                        Search by Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 p-2"
                    placeholder={searchBy === 'username' ? "Username" : "Email"}
                    list="available-users"
                  />
                  
                  <datalist id="available-users">
                    {availableUsers.map(user => (
                      <option key={user.id} value={searchBy === 'username' ? user.username : user.email} />
                    ))}
                  </datalist>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Add'
                  )}
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
            Add friends to share your grocery lists
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
