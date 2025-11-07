'use client';

import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

interface LanguageSwitcherProps {
  collapsed?: boolean;
}

export default function LanguageSwitcher({ collapsed = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n();

  const currentLanguage = languages.find((lang) => lang.code === locale);

  if (collapsed) {
    // Collapsed sidebar version - only show icon
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-12 h-12 p-0 flex items-center justify-center hover:bg-blue-50"
            title={currentLanguage?.nativeName}
          >
            <Globe className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-48">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => setLocale(language.code as 'en' | 'zh')}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.nativeName}</span>
              </span>
              {locale === language.code && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Expanded sidebar version - full width button
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-medium w-full justify-start hover:bg-blue-50"
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          <span className="flex items-center gap-2 flex-1">
            <span>{currentLanguage?.flag}</span>
            <span className="truncate">{currentLanguage?.nativeName}</span>
          </span>
          <ChevronDown className="w-3 h-3 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLocale(language.code as 'en' | 'zh')}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.nativeName}</span>
            </span>
            {locale === language.code && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
