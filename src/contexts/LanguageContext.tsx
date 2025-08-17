import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'mr' | 'gu' | 'bn' | 'ta' | 'te' | 'kn' | 'ml' | 'pa';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language') as Language;
    return saved || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translations object
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'home': 'Home',
    'profile': 'Profile',
    'settings': 'Settings',
    'about': 'About',
    'terms': 'Terms & Conditions',
    'login': 'Login',
    'logout': 'Logout',
    
    // Categories
    'all_categories': 'All Categories',
    'browse_categories': 'Browse Categories',
    'cars': 'Cars',
    'properties': 'Properties',
    'mobiles': 'Mobiles',
    'jobs': 'Jobs',
    'fashion': 'Fashion',
    'bikes': 'Bikes',
    'electronics': 'Electronics & Appliances',
    'commercial': 'Commercial Vehicles',
    'furniture': 'Furniture',
    'pets': 'Pets',
    'kids': 'Kids',
    'music': 'Music & Instruments',
    'sports': 'Sports & Fitness',
    'books': 'Books',
    'services': 'Services',
    'gaming': 'Gaming',
    'photography': 'Photography',
    'jewelry': 'Jewelry & Watches',
    'tools': 'Tools & Hardware',
    'beauty': 'Health & Beauty',
    'audio': 'Audio & Headphones',
    'computers': 'Computers & Laptops',
    'tv': 'TV & Home Theater',
    'music': 'Musical Instruments',
    'others': 'Others',
    
    // Post types
    'all': 'All',
    'sell': 'Sell',
    'want': 'Want',
    
    // Common
    'search': 'Search',
    'filter': 'Filter',
    'location': 'Location',
    'price': 'Price',
    'welcome': 'Welcome to Qbuyse',
    'marketplace_tagline': 'Your trusted local marketplace',
    'scroll_hint': '← Scroll →',
  },
  
  hi: {
    // Navigation
    'home': 'होम',
    'profile': 'प्रोफाइल',
    'settings': 'सेटिंग्स',
    'about': 'हमारे बारे में',
    'terms': 'नियम और शर्तें',
    'login': 'लॉगिन',
    'logout': 'लॉगआउट',
    
    // Categories
    'all_categories': 'सभी श्रेणियां',
    'browse_categories': 'श्रेणियां ब्राउज़ करें',
    'cars': 'कारें',
    'properties': 'संपत्ति',
    'mobiles': 'मोबाइल',
    'jobs': 'नौकरियां',
    'fashion': 'फैशन',
    'bikes': 'बाइक',
    'electronics': 'इलेक्ट्रॉनिक्स और उपकरण',
    'commercial': 'वाणिज्यिक वाहन',
    'furniture': 'फर्नीचर',
    'pets': 'पालतू जानवर',
    'kids': 'बच्चे',
    'music': 'संगीत और वाद्य यंत्र',
    'sports': 'खेल और फिटनेस',
    'books': 'किताबें',
    'services': 'सेवाएं',
    'gaming': 'गेमिंग',
    'photography': 'फोटोग्राफी',
    'jewelry': 'आभूषण और घड़ियां',
    'tools': 'उपकरण और हार्डवेयर',
    'beauty': 'स्वास्थ्य और सौंदर्य',
    'audio': 'ऑडियो और हेडफोन',
    'computers': 'कंप्यूटर और लैपटॉप',
    'tv': 'टीवी और होम थिएटर',
    'music': 'संगीत वाद्य यंत्र',
    'others': 'अन्य',
    
    // Post types
    'all': 'सभी',
    'sell': 'बेचें',
    'want': 'चाहिए',
    
    // Common
    'search': 'खोजें',
    'filter': 'फिल्टर',
    'location': 'स्थान',
    'price': 'कीमत',
    'welcome': 'Qbuyse में आपका स्वागत है',
    'marketplace_tagline': 'आपका विश्वसनीय स्थानीय बाज़ार',
    'scroll_hint': '← स्क्रॉल करें →',
  },
  
  mr: {
    // Navigation
    'home': 'होम',
    'profile': 'प्रोफाइल',
    'settings': 'सेटिंग्ज',
    'about': 'आमच्याबद्दल',
    'terms': 'अटी व शर्ती',
    'login': 'लॉगिन',
    'logout': 'लॉगआउट',
    
    // Categories
    'all_categories': 'सर्व श्रेणी',
    'browse_categories': 'श्रेणी ब्राउझ करा',
    'cars': 'कार',
    'properties': 'मालमत्ता',
    'mobiles': 'मोबाइल',
    'jobs': 'नोकऱ्या',
    'fashion': 'फॅशन',
    'bikes': 'बाइक',
    'electronics': 'इलेक्ट्रॉनिक्स आणि उपकरणे',
    'commercial': 'व्यावसायिक वाहने',
    'furniture': 'फर्निचर',
    'pets': 'पाळीव प्राणी',
    'kids': 'मुले',
    'sports': 'खेळ आणि फिटनेस',
    'books': 'पुस्तके',
    'services': 'सेवा',
    'gaming': 'गेमिंग',
    'photography': 'फोटोग्राफी',
    'jewelry': 'दागिने आणि घड्याळे',
    'tools': 'साधने आणि हार्डवेअर',
    'beauty': 'आरोग्य आणि सौंदर्य',
    'audio': 'ऑडिओ आणि हेडफोन',
    'computers': 'संगणक आणि लॅपटॉप',
    'tv': 'टीव्ही आणि होम थिएटर',
    'music': 'संगीत वाद्ये',
    'others': 'इतर',
    
    // Post types
    'all': 'सर्व',
    'sell': 'विकणे',
    'want': 'हवे',
    
    // Common
    'search': 'शोधा',
    'filter': 'फिल्टर',
    'location': 'स्थान',
    'price': 'किंमत',
    'welcome': 'Qbuyse मध्ये आपले स्वागत',
    'marketplace_tagline': 'तुमचा विश्वसनीय स्थानिक बाजार',
    'scroll_hint': '← स्क्रॉल करा →',
  },
  
  gu: {
    // Navigation
    'home': 'હોમ',
    'profile': 'પ્રોફાઇલ',
    'settings': 'સેટિંગ્સ',
    'about': 'અમારા વિશે',
    'terms': 'નિયમો અને શરતો',
    'login': 'લોગિન',
    'logout': 'લોગઆઉટ',
    
    // Categories
    'all_categories': 'બધી શ્રેણીઓ',
    'browse_categories': 'શ્રેણીઓ બ્રાઉઝ કરો',
    'cars': 'કાર',
    'properties': 'પ્રોપર્ટી',
    'mobiles': 'મોબાઇલ',
    'jobs': 'નોકરીઓ',
    'fashion': 'ફેશન',
    'bikes': 'બાઇક',
    'electronics': 'ઇલેક્ટ્રોનિક્સ અને ઉપકરણો',
    'commercial': 'કોમર્શિયલ વાહનો',
    'furniture': 'ફર્નિચર',
    'pets': 'પાળતુ પ્રાણી',
    'kids': 'બાળકો',
    'music': 'સંગીત અને વાદ્યો',
    'sports': 'રમત અને ફિટનેસ',
    'books': 'પુસ્તકો',
    'services': 'સેવાઓ',
    'gaming': 'ગેમિંગ',
    'photography': 'ફોટોગ્રાફી',
    'jewelry': 'દાગીના અને ઘડિયાળો',
    'tools': 'સાધનો અને હાર્ડવેર',
    'beauty': 'આરોગ્ય અને સૌંદર્ય',
    'audio': 'ઓડિયો અને હેડફોન',
    'computers': 'કમ્પ્યુટર અને લેપટોપ',
    'tv': 'ટીવી અને હોમ થિયેટર',
    'music': 'સંગીત વાદ્યો',
    'others': 'અન્ય',
    
    // Post types
    'all': 'બધું',
    'sell': 'વેચો',
    'want': 'જોઈએ',
    
    // Common
    'search': 'શોધો',
    'filter': 'ફિલ્ટર',
    'location': 'સ્થાન',
    'price': 'કિંમત',
    'welcome': 'Qbuyse માં આપનું સ્વાગત',
    'marketplace_tagline': 'તમારું વિશ્વસનીય સ્થાનિક બજાર',
    'scroll_hint': '← સ્ક્રોલ કરો →',
  },
  
  bn: {
    // Navigation
    'home': 'হোম',
    'profile': 'প্রোফাইল',
    'settings': 'সেটিংস',
    'about': 'আমাদের সম্পর্কে',
    'terms': 'নিয়ম ও শর্তাবলী',
    'login': 'লগইন',
    'logout': 'লগআউট',
    
    // Categories
    'all_categories': 'সব ক্যাটেগরি',
    'browse_categories': 'ক্যাটেগরি ব্রাউজ করুন',
    'cars': 'গাড়ি',
    'properties': 'সম্পত্তি',
    'mobiles': 'মোবাইল',
    'jobs': 'চাকরি',
    'fashion': 'ফ্যাশন',
    'bikes': 'বাইক',
    'electronics': 'ইলেকট্রনিক্স ও যন্ত্রপাতি',
    'commercial': 'বাণিজ্যিক যানবাহন',
    'furniture': 'আসবাবপত্র',
    'pets': 'পোষা প্রাণী',
    'kids': 'শিশু',
    'music': 'সঙ্গীত ও যন্ত্র',
    'sports': 'খেলাধুলা ও ফিটনেস',
    'books': 'বই',
    'services': 'সেবা',
    'gaming': 'গেমিং',
    'photography': 'ফটোগ্রাফি',
    'jewelry': 'গহনা ও ঘড়ি',
    'tools': 'যন্ত্রপাতি ও হার্ডওয়্যার',
    'beauty': 'স্বাস্থ্য ও সৌন্দর্য',
    'audio': 'অডিও ও হেডফোন',
    'computers': 'কম্পিউটার ও ল্যাপটপ',
    'tv': 'টিভি ও হোম থিয়েটার',
    'music': 'বাদ্যযন্ত্র',
    'others': 'অন্যান্য',
    
    // Post types
    'all': 'সব',
    'sell': 'বিক্রি',
    'want': 'চাই',
    
    // Common
    'search': 'খুঁজুন',
    'filter': 'ফিল্টার',
    'location': 'অবস্থান',
    'price': 'দাম',
    'welcome': 'Qbuyse তে আপনাকে স্বাগতম',
    'marketplace_tagline': 'আপনার বিশ্বস্ত স্থানীয় বাজার',
  },
  
  ta: {
    // Navigation
    'home': 'முகப்பு',
    'profile': 'சுயவிவரம்',
    'settings': 'அமைப்புகள்',
    'about': 'எங்களைப் பற்றி',
    'terms': 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
    'login': 'உள்நுழைய',
    'logout': 'வெளியேறு',
    
    // Categories
    'all_categories': 'அனைத்து வகைகள்',
    'browse_categories': 'வகைகளை உலாவுக',
    'cars': 'கார்கள்',
    'properties': 'சொத்துக்கள்',
    'mobiles': 'மொபைல்கள்',
    'jobs': 'வேலைகள்',
    'fashion': 'ஃபேஷன்',
    'bikes': 'பைக்குகள்',
    'electronics': 'மின்னணுவியல் மற்றும் உபகரணங்கள்',
    'commercial': 'வணிக வாகனங்கள்',
    'furniture': 'மரச்சாமான்கள்',
    'pets': 'செல்லப்பிராணிகள்',
    'kids': 'குழந்தைகள்',
    'music': 'இசை மற்றும் கருவிகள்',
    'sports': 'விளையாட்டு மற்றும் உடற்பயிற்சி',
    'books': 'புத்தகங்கள்',
    'services': 'சேவைகள்',
    'others': 'மற்றவை',
    
    // Post types
    'all': 'அனைத்தும்',
    'sell': 'விற்க',
    'want': 'வேண்டும்',
    
    // Common
    'search': 'தேடு',
    'filter': 'வடிகட்டி',
    'location': 'இடம்',
    'price': 'விலை',
    'welcome': 'Qbuyse க்கு வரவேற்கிறோம்',
    'marketplace_tagline': 'உங்கள் நம்பகமான உள்ளூர் சந்தை',
  },
  
  te: {
    // Navigation
    'home': 'హోమ్',
    'profile': 'ప్రొఫైల్',
    'settings': 'సెట్టింగ్స్',
    'about': 'మా గురించి',
    'terms': 'నిబంధనలు మరియు షరతులు',
    'login': 'లాగిన్',
    'logout': 'లాగ్అవుట్',
    
    // Categories
    'all_categories': 'అన్ని వర్గాలు',
    'browse_categories': 'వర్గాలను బ్రౌజ్ చేయండి',
    'cars': 'కార్లు',
    'properties': 'ఆస్తులు',
    'mobiles': 'మొబైల్స్',
    'jobs': 'ఉద్యోగాలు',
    'fashion': 'ఫ్యాషన్',
    'bikes': 'బైక్స్',
    'electronics': 'ఎలక్ట్రానిక్స్ మరియు ఉపకరణాలు',
    'commercial': 'వాణిజ్య వాహనాలు',
    'furniture': 'ఫర్నిచర్',
    'pets': 'పెంపుడు జంతువులు',
    'kids': 'పిల్లలు',
    'music': 'సంగీతం మరియు వాయిద్యాలు',
    'sports': 'క్రీడలు మరియు ఫిట్నెస్',
    'books': 'పుస్తకాలు',
    'services': 'సేవలు',
    'others': 'ఇతరులు',
    
    // Post types
    'all': 'అన్నీ',
    'sell': 'అమ్మండి',
    'want': 'కావాలి',
    
    // Common
    'search': 'వెతకండి',
    'filter': 'ఫిల్టర్',
    'location': 'స్థానం',
    'price': 'ధర',
    'welcome': 'Qbuyse కి స్వాగతం',
    'marketplace_tagline': 'మీ విశ్వసనీయ స్థానిక మార్కెట్',
  },
  
  kn: {
    // Navigation
    'home': 'ಮುಖ್ಯಪುಟ',
    'profile': 'ಪ್ರೊಫೈಲ್',
    'settings': 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    'about': 'ನಮ್ಮ ಬಗ್ಗೆ',
    'terms': 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು',
    'login': 'ಲಾಗಿನ್',
    'logout': 'ಲಾಗ್ಔಟ್',
    
    // Categories
    'all_categories': 'ಎಲ್ಲಾ ವರ್ಗಗಳು',
    'browse_categories': 'ವರ್ಗಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ',
    'cars': 'ಕಾರುಗಳು',
    'properties': 'ಆಸ್ತಿಗಳು',
    'mobiles': 'ಮೊಬೈಲ್‌ಗಳು',
    'jobs': 'ಉದ್ಯೋಗಗಳು',
    'fashion': 'ಫ್ಯಾಷನ್',
    'bikes': 'ಬೈಕ್‌ಗಳು',
    'electronics': 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಉಪಕರಣಗಳು',
    'commercial': 'ವಾಣಿಜ್ಯ ವಾಹನಗಳು',
    'furniture': 'ಪೀಠೋಪಕರಣಗಳು',
    'pets': 'ಸಾಕುಪ್ರಾಣಿಗಳು',
    'kids': 'ಮಕ್ಕಳು',
    'music': 'ಸಂಗೀತ ಮತ್ತು ವಾದ್ಯಗಳು',
    'sports': 'ಕ್ರೀಡೆ ಮತ್ತು ಫಿಟ್ನೆಸ್',
    'books': 'ಪುಸ್ತಕಗಳು',
    'services': 'ಸೇವೆಗಳು',
    'others': 'ಇತರೆ',
    
    // Post types
    'all': 'ಎಲ್ಲಾ',
    'sell': 'ಮಾರಾಟ',
    'want': 'ಬೇಕು',
    
    // Common
    'search': 'ಹುಡುಕಿ',
    'filter': 'ಫಿಲ್ಟರ್',
    'location': 'ಸ್ಥಳ',
    'price': 'ಬೆಲೆ',
    'welcome': 'Qbuyse ಗೆ ಸ್ವಾಗತ',
    'marketplace_tagline': 'ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ',
  },
  
  ml: {
    // Navigation
    'home': 'ഹോം',
    'profile': 'പ്രൊഫൈൽ',
    'settings': 'സെറ്റിംഗ്സ്',
    'about': 'ഞങ്ങളെ കുറിച്ച്',
    'terms': 'നിബന്ധനകളും വ്യവസ്ഥകളും',
    'login': 'ലോഗിൻ',
    'logout': 'ലോഗൗട്ട്',
    
    // Categories
    'all_categories': 'എല്ലാ വിഭാഗങ്ങളും',
    'browse_categories': 'വിഭാഗങ്ങൾ ബ്രൗസ് ചെയ്യുക',
    'cars': 'കാറുകൾ',
    'properties': 'പ്രോപ്പർട്ടികൾ',
    'mobiles': 'മൊബൈലുകൾ',
    'jobs': 'ജോലികൾ',
    'fashion': 'ഫാഷൻ',
    'bikes': 'ബൈക്കുകൾ',
    'electronics': 'ഇലക്ട്രോണിക്സും ഉപകരണങ്ങളും',
    'commercial': 'വാണിജ്യ വാഹനങ്ങൾ',
    'furniture': 'ഫർണിച്ചർ',
    'pets': 'വളർത്തുമൃഗങ്ങൾ',
    'kids': 'കുട്ടികൾ',
    'music': 'സംഗീതവും വാദ്യോപകരണങ്ങളും',
    'sports': 'കായികവും ഫിറ്റ്നസും',
    'books': 'പുസ്തകങ്ങൾ',
    'services': 'സേവനങ്ങൾ',
    'others': 'മറ്റുള്ളവ',
    
    // Post types
    'all': 'എല്ലാം',
    'sell': 'വിൽക്കുക',
    'want': 'വേണം',
    
    // Common
    'search': 'തിരയുക',
    'filter': 'ഫിൽട്ടർ',
    'location': 'സ്ഥലം',
    'price': 'വില',
    'welcome': 'Qbuyse ലേക്ക് സ്വാഗതം',
    'marketplace_tagline': 'നിങ്ങളുടെ വിശ്വസനീയ പ്രാദേശിക മാർക്കറ്റ്',
  },
  
  pa: {
    // Navigation
    'home': 'ਘਰ',
    'profile': 'ਪ੍ਰੋਫਾਈਲ',
    'settings': 'ਸੈਟਿੰਗਾਂ',
    'about': 'ਸਾਡੇ ਬਾਰੇ',
    'terms': 'ਨਿਯਮ ਅਤੇ ਸ਼ਰਤਾਂ',
    'login': 'ਲਾਗਇਨ',
    'logout': 'ਲਾਗਆਉਟ',
    
    // Categories
    'all_categories': 'ਸਾਰੀਆਂ ਸ਼ਰੇਣੀਆਂ',
    'browse_categories': 'ਸ਼ਰੇਣੀਆਂ ਬ੍ਰਾਊਜ਼ ਕਰੋ',
    'cars': 'ਕਾਰਾਂ',
    'properties': 'ਜਾਇਦਾਦਾਂ',
    'mobiles': 'ਮੋਬਾਈਲ',
    'jobs': 'ਨੌਕਰੀਆਂ',
    'fashion': 'ਫੈਸ਼ਨ',
    'bikes': 'ਬਾਈਕਾਂ',
    'electronics': 'ਇਲੈਕਟ੍ਰੋਨਿਕਸ ਅਤੇ ਉਪਕਰਣ',
    'commercial': 'ਵਪਾਰਕ ਵਾਹਨ',
    'furniture': 'ਫਰਨੀਚਰ',
    'pets': 'ਪਾਲਤੂ ਜਾਨਵਰ',
    'kids': 'ਬੱਚੇ',
    'music': 'ਸੰਗੀਤ ਅਤੇ ਸਾਜ਼',
    'sports': 'ਖੇਡਾਂ ਅਤੇ ਫਿਟਨੈਸ',
    'books': 'ਕਿਤਾਬਾਂ',
    'services': 'ਸੇਵਾਵਾਂ',
    'others': 'ਹੋਰ',
    
    // Post types
    'all': 'ਸਭ',
    'sell': 'ਵੇਚੋ',
    'want': 'ਚਾਹੀਦਾ',
    
    // Common
    'search': 'ਖੋਜੋ',
    'filter': 'ਫਿਲਟਰ',
    'location': 'ਸਥਾਨ',
    'price': 'ਕੀਮਤ',
    'welcome': 'Qbuyse ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ',
    'marketplace_tagline': 'ਤੁਹਾਡਾ ਭਰੋਸੇਮੰਦ ਸਥਾਨਕ ਬਾਜ਼ਾਰ',
  },
};