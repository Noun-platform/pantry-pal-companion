
export const translations = {
  en: {
    title: "Nutrition Assistant",
    backToHome: "Back to Home",
    placeholder: "Ask about food or your grocery list...",
    emptyChat: "Ask me about calories in any food or your grocery list!",
    examples: "Examples:",
    example1: "How many calories in an apple?",
    example2: "Nutritional information for chicken breast",
    example3: "What's on my grocery list?",
    example4: "Tell me about the items in my list",
    you: "You",
    assistant: "Nutrition Assistant",
    thinking: "Thinking...",
    footer: "Nutrition Assistant"
  },
  np: {
    title: "पोषण सहायक",
    backToHome: "होमपेजमा फर्कनुहोस्",
    placeholder: "खाना वा तपाईंको किराना सूचीको बारेमा सोध्नुहोस्...",
    emptyChat: "मलाई कुनै पनि खानामा क्यालोरी वा तपाईंको किराना सूचीको बारेमा सोध्नुहोस्!",
    examples: "उदाहरणहरू:",
    example1: "स्याउमा कति क्यालोरी हुन्छ?",
    example2: "कुखुराको छातीको पोषण जानकारी",
    example3: "मेरो किराना सूचीमा के छ?",
    example4: "मेरो सूचीमा भएका वस्तुहरूको बारेमा बताउनुहोस्",
    you: "तपाईं",
    assistant: "पोषण सहायक",
    thinking: "सोच्दै...",
    footer: "पोषण सहायक"
  }
};

// Translate to Nepali function
export const translateToNepali = (text: string): string => {
  const commonFoodTranslations: Record<string, string> = {
    'apple': 'स्याउ',
    'banana': 'केरा',
    'bread': 'रोटी',
    'rice': 'भात',
    'chicken': 'कुखुरा',
    'egg': 'अण्डा',
    'milk': 'दूध',
    'pizza': 'पिज्जा',
    'pasta': 'पास्ता',
    'chocolate': 'चकलेट',
    'potato': 'आलु',
    'carrot': 'गाजर',
    'orange': 'सुन्तला',
    'steak': 'स्टेक',
    'salmon': 'सालमन',
    'calories': 'क्यालोरी',
    'protein': 'प्रोटीन',
    'fat': 'बोसो',
    'carbohydrate': 'कार्बोहाइड्रेट',
    'vitamin': 'भिटामिन',
    'mineral': 'खनिज',
    'contains': 'समावेश छ',
    'about': 'बारे',
    'nutrient': 'पोषक तत्व',
    'food': 'खाना',
    'grocery': 'किराना',
    'list': 'सूची',
    'items': 'सामानहरू',
    'nutrition': 'पोषण',
    'healthy': 'स्वस्थ',
    'diet': 'आहार'
  };
  
  // Very basic translation - replace known words
  let translated = text;
  Object.entries(commonFoodTranslations).forEach(([english, nepali]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, nepali);
  });
  
  return translated;
};
