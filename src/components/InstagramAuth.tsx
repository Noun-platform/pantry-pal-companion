
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const InstagramAuth: React.FC = () => {
  const { user, loading, signUp, signIn, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    await signIn(values.email, values.password);
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    await signUp(values.username, values.email, values.password);
  };

  const switchForm = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    signupForm.reset();
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass p-4 rounded-xl mb-6 flex justify-center"
      >
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </motion.div>
    );
  }

  if (user?.isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between p-4 glass rounded-xl mb-6"
      >
        <div className="flex items-center gap-3">
          <img 
            src={user.avatarUrl} 
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
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
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-primary">
          <User size={24} />
          <h3 className="font-semibold text-xl">
            {isLogin ? "Login to Your Account" : "Create an Account"}
          </h3>
        </div>

        {isLogin ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input className="pl-10" placeholder="your.email@example.com" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input className="pl-10" type="password" placeholder="••••••" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-2"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>Login</>
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
              <FormField
                control={signupForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input className="pl-10" placeholder="your_username" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input className="pl-10" placeholder="your.email@example.com" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input className="pl-10" type="password" placeholder="••••••" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-2"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>Sign Up</>
                )}
              </Button>
            </form>
          </Form>
        )}
        
        <div className="text-center">
          <button
            type="button"
            onClick={switchForm}
            className="text-sm text-primary hover:underline"
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          All user data is stored locally in your browser
        </p>
      </div>
    </motion.div>
  );
};

export default InstagramAuth;
