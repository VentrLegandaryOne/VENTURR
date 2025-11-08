/**
 * Language Switcher Component
 * Allows users to switch between supported languages
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { i18n, Language } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'button';
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showLabel = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(i18n.getLanguage());

  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = i18n.subscribe(() => {
      setCurrentLang(i18n.getLanguage());
    });

    return unsubscribe;
  }, []);

  const handleLanguageChange = (lang: Language) => {
    i18n.setLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
  };

  const availableLanguages = i18n.getAvailableLanguages();

  if (variant === 'inline') {
    return (
      <div className="flex gap-2 flex-wrap">
        {availableLanguages.map((lang) => (
          <Button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            variant={currentLang === lang ? 'default' : 'outline'}
            size="sm"
            className={
              currentLang === lang
                ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                : ''
            }
          >
            {lang.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Globe className="w-4 h-4" />
        {showLabel && i18n.getLanguageName(currentLang)}
      </Button>
    );
  }

  // Default dropdown variant
  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="gap-2"
      >
        <Globe className="w-4 h-4" />
        {showLabel && (
          <>
            <span>{i18n.getLanguageName(currentLang)}</span>
            <span className="text-xs">▼</span>
          </>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-48 shadow-lg z-50 p-2">
          <div className="space-y-1">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                  currentLang === lang
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-medium">{i18n.getLanguageName(lang)}</div>
                <div className="text-xs text-gray-500">{lang.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default LanguageSwitcher;

