
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useGrocery } from '@/contexts/GroceryContext';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { translations, translateToNepali } from '@/utils/translations';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Simple nutrition data for common foods
const nutritionDatabase = {
  'apple': 'An apple contains about 95 calories, is high in fiber, vitamin C, and various antioxidants.',
  'banana': 'A medium banana contains about 105 calories and is rich in potassium and vitamin B6.',
  'bread': 'A slice of white bread contains about 80 calories. Whole grain bread has similar calories but more fiber and nutrients.',
  'rice': 'A cup of cooked white rice contains about 200 calories, while brown rice has slightly fewer calories and more fiber.',
  'chicken': 'A 3.5oz (100g) serving of chicken breast contains about 165 calories and is high in protein.',
  'egg': 'One large egg contains about 70 calories, with 6g of protein and various vitamins and minerals.',
  'milk': 'A cup of whole milk contains about 150 calories, while skim milk has about 80 calories.',
  'pizza': 'A slice of cheese pizza contains about 250-300 calories, depending on size and toppings.',
  'pasta': 'One cup of cooked pasta contains about 200 calories, primarily from carbohydrates.',
  'chocolate': 'A 1.5oz (43g) bar of milk chocolate contains about 235 calories and is high in sugar and fat.',
  'potato': 'A medium baked potato contains about 160 calories and is a good source of potassium and vitamin C.',
  'carrot': 'A medium carrot contains about 25 calories and is high in vitamin A.',
  'orange': 'A medium orange contains about 60 calories and is rich in vitamin C.',
  'steak': 'A 3.5oz (100g) serving of lean beef steak contains about 180 calories and is high in protein and iron.',
  'salmon': 'A 3.5oz (100g) serving of salmon contains about 200 calories and is rich in omega-3 fatty acids.'
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'np'>('en');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { items } = useGrocery();
  
  const t = translations[language];
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fallbackResponse = (query: string): string => {
    query = query.toLowerCase();
    let response = '';
    
    // Check if the query is about the grocery list
    if (query.includes('list') || query.includes('grocery') || query.includes('groceries') || query.includes('shopping')) {
      if (items.length === 0) {
        response = "Your grocery list is currently empty. You can add items from the main page.";
      } else {
        // List all items
        const itemsList = items.map(item => `${item.name} ($${item.price.toFixed(2)})`).join(', ');
        response = `Your grocery list contains: ${itemsList}. The total price is $${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}.`;
      }
      
      return language === 'np' ? translateToNepali(response) : response;
    }
    
    // Check if the query is about a specific item on the list
    for (const item of items) {
      const itemName = item.name.toLowerCase();
      if (query.includes(itemName)) {
        // If the item is on their list, provide information about it
        const nutritionInfo = Object.entries(nutritionDatabase).find(([food]) => 
          itemName.includes(food) || food.includes(itemName)
        );
        
        if (nutritionInfo) {
          response = `You have ${item.name} on your list for $${item.price.toFixed(2)}. ${nutritionInfo[1]}`;
        } else {
          response = `You have ${item.name} on your list for $${item.price.toFixed(2)}. I don't have specific nutritional information for this item.`;
        }
        
        return language === 'np' ? translateToNepali(response) : response;
      }
    }
    
    // Check if the query mentions any food in our database
    for (const [food, info] of Object.entries(nutritionDatabase)) {
      if (query.includes(food)) {
        // Check if the food is on their grocery list
        const matchingItem = items.find(item => 
          item.name.toLowerCase().includes(food) || food.includes(item.name.toLowerCase())
        );
        
        if (matchingItem) {
          response = `You have ${matchingItem.name} on your list for $${matchingItem.price.toFixed(2)}. ${info}`;
        } else {
          response = info;
        }
        
        return language === 'np' ? translateToNepali(response) : response;
      }
    }
    
    // General responses for common nutritional questions
    if (query.includes('calorie') || query.includes('calories')) {
      response = 'Calories are a measure of energy in food. Daily calorie needs vary by age, gender, weight, height, and activity level. An average adult needs about 2000-2500 calories per day.';
    } else if (query.includes('protein')) {
      response = 'Protein is essential for building muscle and repairing tissues. Good sources include meat, fish, eggs, dairy, legumes, and nuts. Adults typically need 0.8g of protein per kg of body weight daily.';
    } else if (query.includes('carb') || query.includes('carbohydrate')) {
      response = 'Carbohydrates are your body\'s main energy source. Complex carbs (whole grains, vegetables) are more nutritious than simple carbs (sugar, white bread). They should make up 45-65% of your daily calories.';
    } else if (query.includes('fat')) {
      response = 'Healthy fats are essential for brain health and hormone production. Sources include avocados, nuts, olive oil, and fatty fish. Fats should make up 20-35% of your daily calories.';
    } else if (query.includes('vitamin')) {
      response = 'Vitamins are essential nutrients that your body needs in small amounts. They come from a variety of foods, especially fruits and vegetables. Each vitamin has specific roles in maintaining health.';
    } else if (query.includes('mineral')) {
      response = 'Minerals like calcium, iron, and potassium are essential for various bodily functions. They come from diverse food sources including dairy, meat, fruits, vegetables, and whole grains.';
    } else if (query.includes('diet') || query.includes('weight loss')) {
      response = 'Healthy weight loss involves a balanced diet with a moderate calorie deficit, combined with regular physical activity. Focus on nutrient-dense foods rather than severe restrictions.';
    } else {
      // Default response
      response = "I don't have specific information about that food item. Generally, a balanced diet should include a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. If you're looking for specific nutritional information, try asking about common foods like apples, bread, chicken, or rice.";
    }
    
    return language === 'np' ? translateToNepali(response) : response;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: input } as Message;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Try using the DeepSeek API first
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sk-3f945e881b154ec985cf69be3e4220ae` 
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: language === 'en' 
                ? 'You are a nutrition expert assistant. Provide information about calories and nutritional content of food items. Be concise and helpful.'
                : 'तपाईं एक पोषण विशेषज्ञ सहायक हुनुहुन्छ। खाना वस्तुहरूको क्यालोरी र पौष्टिक सामग्रीको बारेमा जानकारी प्रदान गर्नुहोस्। संक्षिप्त र सहयोगी हुनुहोस्।'
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
        // If API returns an error, use our fallback
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
      
      // Use our fallback response system
      const fallbackContent = fallbackResponse(input);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: fallbackContent
      }]);
      
      // Only show toast for unexpected errors, not for our controlled fallback
      if (error instanceof Error && error.message !== 'Insufficient Balance') {
        toast.error(language === 'en' 
          ? 'Using local nutrition database. API connection failed.' 
          : 'स्थानीय पोषण डाटाबेस प्रयोग गर्दै। API जडान असफल भयो।');
      }
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
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center">
          <Link to="/" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>
        <div className="flex gap-2">
          <LanguageToggle language={language} setLanguage={setLanguage} />
          <ThemeToggle />
        </div>
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
                <p className="mb-2">{t.emptyChat}</p>
                <p className="text-sm">{t.examples}</p>
                <ul className="text-sm">
                  <li>{t.example1}</li>
                  <li>{t.example2}</li>
                  <li>{t.example3}</li>
                  <li>{t.example4}</li>
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
                    {message.role === 'user' ? t.you : t.assistant}
                  </p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div className="p-3 rounded-lg bg-muted mr-8">
                <p className="text-sm font-semibold mb-1">{t.assistant}</p>
                <p className="animate-pulse">{t.thinking}</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </Button>
        </form>
      </motion.div>
      
      <p className="text-center text-xs text-muted-foreground mt-4">
        {t.footer}
      </p>
    </div>
  );
};

export default ChatPage;
