'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (resolvedTheme === undefined) {
    return (
      <Button variant="ghost" size="icon" className="opacity-0 pointer-events-none">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
      className="transition-all duration-200"
    >
      {currentTheme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}