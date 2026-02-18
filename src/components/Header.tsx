import { LogIn, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import logoImage from '@/logo quinta.png';

interface HeaderProps {
  isAdmin: boolean;
  onLogout?: () => void;
}

export const Header = ({ isAdmin, onLogout }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 flex items-center transition-transform group-hover:scale-105">
            <img 
              src={logoImage} 
              alt="Al Pie del Asador" 
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground leading-tight">
              Al Pie del Asador
            </h1>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {isAdmin && (
            <>
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Panel Admin</span>
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
