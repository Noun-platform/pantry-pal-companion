
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface LanguageToggleProps {
  language: 'en' | 'np';
  setLanguage: (language: 'en' | 'np') => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, setLanguage }) => {
  return (
    <ToggleGroup type="single" value={language} onValueChange={(value) => value && setLanguage(value as 'en' | 'np')} className="border rounded-lg">
      <ToggleGroupItem value="en" aria-label="Toggle English">
        English
      </ToggleGroupItem>
      <ToggleGroupItem value="np" aria-label="Toggle Nepali">
        नेपाली
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default LanguageToggle;
