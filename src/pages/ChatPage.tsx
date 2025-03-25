
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: input } as Message;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sk-3f945e881b154ec985cf69be3e4220ae` // This is not recommended for production
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition expert assistant. Provide information about calories and nutritional content of food items. Be concise and helpful.'
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to get response');
      }
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const assistantMessage = {
          role: 'assistant',
          content: data.choices[0].message.content
        } as Message;
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      toast.error('Failed to get a response. Please try again.');
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or ask a different question.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center mb-6"
      >
        <Link to="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold">Nutrition Assistant</h1>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 flex flex-col h-[calc(100vh-12rem)]"
      >
        <ScrollArea className="flex-1 mb-4 p-4 border rounded-lg bg-background" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="mb-2">Ask me about calories in any food!</p>
                <p className="text-sm">Examples:</p>
                <ul className="text-sm">
                  <li>"How many calories in an apple?"</li>
                  <li>"Nutritional information for chicken breast"</li>
                  <li>"Is pizza healthy?"</li>
                </ul>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary/10 ml-8' 
                      : 'bg-muted mr-8'
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {message.role === 'user' ? 'You' : 'Nutrition Assistant'}
                  </p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div className="p-3 rounded-lg bg-muted mr-8">
                <p className="text-sm font-semibold mb-1">Nutrition Assistant</p>
                <p className="animate-pulse">Thinking...</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about food calories..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </Button>
        </form>
      </motion.div>
      
      <p className="text-center text-xs text-muted-foreground mt-4">
        Powered by DeepSeek AI
      </p>
    </div>
  );
};

export default ChatPage;
