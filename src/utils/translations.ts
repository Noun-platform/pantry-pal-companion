
export const translations = {
  en: {
    title: "Nutrition Assistant",
    backToHome: "Back to Home",
    placeholder: "Ask me anything about food or your grocery list...",
    emptyChat: "Hi there! I'm your friendly nutrition assistant. How can I help you today?",
    examples: "Here are some things you can ask me:",
    example1: "What nutrients are in an apple?",
    example2: "Can you tell me about chicken breast?",
    example3: "What's on my grocery list?",
    example4: "Is dark chocolate healthier than milk chocolate?",
    you: "You",
    assistant: "Nutrition Buddy",
    thinking: "Thinking about that...",
    footer: "Your Personal Nutrition Assistant"
  },
  np: {
    title: "पोषण सहायक",
    backToHome: "होमपेजमा फर्कनुहोस्",
    placeholder: "खाना वा तपाईंको किराना सूचीको बारेमा केही सोध्नुहोस्...",
    emptyChat: "नमस्ते! म तपाईंको मैत्रीपूर्ण पोषण सहायक हुँ। आज म तपाईंलाई कसरी मद्दत गर्न सक्छु?",
    examples: "यहाँ केही कुराहरू छन् जुन तपाईं मलाई सोध्न सक्नुहुन्छ:",
    example1: "स्याउमा के-के पोषक तत्वहरू छन्?",
    example2: "के तपाईं मलाई कुखुराको छातीको बारेमा बताउन सक्नुहुन्छ?",
    example3: "मेरो किराना सूचीमा के छ?",
    example4: "के कालो चकलेट दूध चकलेट भन्दा स्वस्थ छ?",
    you: "तपाईं",
    assistant: "पोषण साथी",
    thinking: "त्यसबारे सोच्दै...",
    footer: "तपाईंको व्यक्तिगत पोषण सहायक"
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
    'diet': 'आहार',
    'amazing': 'अद्भुत',
    'great': 'उत्तम',
    'wonderful': 'अद्भुत',
    'delicious': 'स्वादिष्ट',
    'perfect': 'उत्तम',
    'love': 'माया',
    'enjoy': 'आनन्द',
    'favorite': 'मनपर्ने',
    'body': 'शरीर',
    'health': 'स्वास्थ्य',
    'energy': 'ऊर्जा'
  };
  
  // Very basic translation - replace known words
  let translated = text;
  Object.entries(commonFoodTranslations).forEach(([english, nepali]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, nepali);
  });
  
  return translated;
};
