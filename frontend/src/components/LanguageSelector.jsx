import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, changeLanguage, languages } = useLanguage();

  return (
    <div className="flex gap-2 flex-wrap">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? 'default' : 'outline'}
          size="sm"
          onClick={() => changeLanguage(lang.code)}
          className={`${
            language === lang.code
              ? 'bg-white text-blue-600 hover:bg-white/90'
              : 'bg-white/10 text-white hover:bg-white/20 border-white/50'
          } backdrop-blur-sm transition-all`}
        >
          <span className="mr-2">{lang.flag}</span>
          {lang.name}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSelector;
