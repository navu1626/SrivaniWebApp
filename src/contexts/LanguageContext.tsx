import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Common
    'app.title': 'प्रश्नसार',
    'app.subtitle': 'प्रश्नात् ज्ञानं, ज्ञानात् मोक्षः',
    'common.login': 'Login',
    'common.register': 'Register',
    'common.dashboard': 'Dashboard',
    'common.admin': 'Admin',
    'common.logout': 'Logout',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    
    // Home Page
    'home.welcome': 'Welcome to Sarvagyyam Prashanasaar',
    'home.description': 'Test your spiritual knowledge and participate in religious competitions',
    'home.activeCompetitions': 'Active Competitions',
    'home.upcomingCompetitions': 'Upcoming Competitions',
    'home.startQuiz': 'Start Quiz',
    'home.viewDetails': 'View Details',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.mobile': 'Mobile Number (WhatsApp)',
    'auth.ageGroup': 'Age Group',
    'auth.child': 'Child (5-12)',
    'auth.youth': 'Youth (13-25)',
    'auth.adult': 'Adult (26+)',
    
    // Dashboard
    'dashboard.myCompetitions': 'My Competitions',
    'dashboard.completed': 'Completed',
    'dashboard.ongoing': 'Ongoing',
    'dashboard.upcoming': 'Upcoming',
    'dashboard.results': 'Results',
    
    // Admin
    'admin.createCompetition': 'Create Competition',
    'admin.manageCompetitions': 'Manage Competitions',
    'admin.submissions': 'Submissions',
    'admin.analytics': 'Analytics',
    'admin.users': 'Users',
  },
  hi: {
    // Common
    'app.title': 'प्रश्नसार',
    'app.subtitle': 'प्रश्नात् ज्ञानं, ज्ञानात् मोक्षः',
    'common.login': 'लॉगिन',
    'common.register': 'पंजीकरण',
    'common.dashboard': 'डैशबोर्ड',
    'common.admin': 'व्यवस्थापक',
    'common.logout': 'लॉगआउट',
    'common.submit': 'जमा करें',
    'common.cancel': 'रद्द करें',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    'common.save': 'सहेजें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    
    // Home Page
    'home.welcome': 'सर्वज्ञ्यम् प्रश्नसार क्विज में आपका स्वागत है',
    'home.description': 'अपने आध्यात्मिक ज्ञान का परीक्षण करें और धार्मिक प्रतियोगिताओं में भाग लें',
    'home.activeCompetitions': 'सक्रिय प्रतियोगिताएं',
    'home.upcomingCompetitions': 'आगामी प्रतियोगिताएं',
    'home.startQuiz': 'क्विज शुरू करें',
    'home.viewDetails': 'विवरण देखें',
    
    // Auth
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.name': 'पूरा नाम',
    'auth.mobile': 'मोबाइल नंबर',
    'auth.ageGroup': 'आयु समूह',
    'auth.child': 'बच्चे (5-12)',
    'auth.youth': 'युवा (13-25)',
    'auth.adult': 'वयस्क (26+)',
    
    // Dashboard
    'dashboard.myCompetitions': 'मेरी प्रतियोगिताएं',
    'dashboard.completed': 'पूर्ण',
    'dashboard.ongoing': 'चल रही',
    'dashboard.upcoming': 'आगामी',
    'dashboard.results': 'परिणाम',
    
    // Admin
    'admin.createCompetition': 'प्रतियोगिता बनाएं',
    'admin.manageCompetitions': 'प्रतियोगिताएं प्रबंधित करें',
    'admin.submissions': 'प्रविष्टियां',
    'admin.analytics': 'विश्लेषण',
    'admin.users': 'उपयोगकर्ता',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (undefined === context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};