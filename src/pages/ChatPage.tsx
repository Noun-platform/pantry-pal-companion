
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

// Simple nutrition data for common foods with friendly, conversational responses
const nutritionDatabase = {
  'apple': 'I love apples! They have about 95 calories and are packed with fiber and vitamin C. They make for a perfect snack that keeps you energized throughout the day!',
  'banana': 'Bananas are amazing! A medium one has around 105 calories and is full of potassium that helps your muscles. They\'re nature\'s perfect on-the-go snack!',
  'bread': 'Bread is a staple in many homes! A slice of white bread has about 80 calories. If you can, try whole grain bread - it has similar calories but more fiber and nutrients to keep you feeling fuller longer!',
  'rice': 'Rice is wonderful! A cup of cooked white rice contains about 200 calories. Brown rice has slightly fewer calories and more fiber - both are great options depending on what you\'re cooking!',
  'chicken': 'Chicken is super versatile! A 3.5oz serving of chicken breast has about 165 calories and is packed with protein. It\'s great for building muscle and keeping you satisfied!',
  'egg': 'Eggs are nutritional powerhouses! One large egg has just about 70 calories with 6g of high-quality protein. They\'re perfect for breakfast or adding protein to any meal!',
  'milk': 'Milk is so nourishing! A cup of whole milk has about 150 calories, while skim milk has about 80. Both are excellent sources of calcium for strong bones!',
  'pizza': 'Pizza can definitely be part of a balanced diet! A slice typically has about 250-300 calories. Enjoy it with a side salad for a more balanced meal!',
  'pasta': 'Pasta is delicious and satisfying! One cup of cooked pasta contains about 200 calories. Try whole grain varieties for extra fiber and nutrients!',
  'chocolate': 'A little chocolate is good for the soul! A 1.5oz bar of milk chocolate has about 235 calories. Dark chocolate has less sugar and more antioxidants if you\'re looking for a healthier option!',
  'potato': 'Potatoes are incredibly versatile! A medium baked potato has about 160 calories and is a great source of potassium and vitamin C. They\'re perfect with healthy toppings!',
  'carrot': 'Carrots are crunchy and nutritious! A medium carrot has just about 25 calories and tons of vitamin A for healthy eyes. They make a perfect snack!',
  'orange': 'Oranges are refreshing! A medium orange has about 60 calories and is bursting with vitamin C. They\'re perfect for boosting your immune system!',
  'steak': 'Steak can be a nutritious choice! A 3.5oz serving of lean beef steak has about 180 calories and is rich in protein and iron. It\'s great for maintaining energy levels!',
  'salmon': 'Salmon is fantastic for heart health! A 3.5oz serving contains about 200 calories and is loaded with omega-3 fatty acids. It\'s one of the healthiest proteins you can eat!'
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
        response = "It looks like your grocery list is empty at the moment. Feel free to add some items from the main page whenever you're ready!";
      } else {
        // List all items with a friendly tone
        const itemsList = items.map(item => `${item.name} ($${item.price.toFixed(2)})`).join(', ');
        response = `I took a peek at your grocery list and found: ${itemsList}. Your current total comes to $${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}. Is there anything specific you'd like to know about these items?`;
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
          response = `I see you have ${item.name} on your list for $${item.price.toFixed(2)}. ${nutritionInfo[1]} Would you like to know more about planning meals with this ingredient?`;
        } else {
          response = `I noticed you have ${item.name} on your list for $${item.price.toFixed(2)}. While I don't have specific nutritional details for this item, I'd be happy to look up more information if you're curious about it!`;
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
          response = `Great news! You already have ${matchingItem.name} on your list for $${matchingItem.price.toFixed(2)}. ${info}`;
        } else {
          response = `${info} Would you like to add this to your grocery list?`;
        }
        
        return language === 'np' ? translateToNepali(response) : response;
      }
    }
    
    // General responses for common nutritional questions with friendly tone
    if (query.includes('calorie') || query.includes('calories')) {
      response = 'Calories are basically your body\'s fuel! Most adults need around 2000-2500 calories daily, but it varies based on your age, size, and how active you are. What matters most is getting those calories from nutritious foods that make you feel great!';
    } else if (query.includes('protein')) {
      response = 'Protein is amazing for your body! It helps build muscle and keeps you feeling full. You can find it in foods like meat, eggs, beans, and nuts. Most people need about 0.8g per kg of body weight daily. What are your favorite protein-rich foods?';
    } else if (query.includes('carb') || query.includes('carbohydrate')) {
      response = 'Carbs are your body\'s favorite energy source! Complex carbs like whole grains and vegetables give you longer-lasting energy than simple carbs like sugar. They should make up about 45-65% of what you eat. What kind of carbs do you enjoy most?';
    } else if (query.includes('fat')) {
      response = 'Healthy fats are essential for your brain and hormones! You can find them in foods like avocados, nuts, olive oil, and fish. They should make up about 20-35% of your daily calories. These are the fats that actually keep your body happy and healthy!';
    } else if (query.includes('vitamin')) {
      response = 'Vitamins are like little health superheroes in your food! They come mostly from colorful fruits and vegetables. Each vitamin has a special job - like keeping your skin glowing, your eyes sharp, or your immune system strong. What fruits and veggies do you enjoy?';
    } else if (query.includes('mineral')) {
      response = 'Minerals are essential nutrients your body needs! Things like calcium for strong bones, iron for healthy blood, and potassium for heart health. You can get them from a variety of foods like dairy, meat, fruits, and whole grains. Is there a specific mineral you\'d like to learn more about?';
    } else if (query.includes('diet') || query.includes('weight loss')) {
      response = 'The best approach to healthy eating is finding what works for YOU! Focus on adding nutritious foods you enjoy rather than strict rules. Small, consistent changes and staying active tend to work better than drastic diets. What kind of healthy foods do you already enjoy?';
    } else {
      // Default response
      response = "I don't have specific information about that food, but I'd love to help you learn more! Generally, a balanced diet includes lots of colorful fruits and vegetables, whole grains, lean proteins, and healthy fats. Is there a specific food you're curious about? I know quite a bit about common foods like apples, bread, chicken, and rice!";
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
