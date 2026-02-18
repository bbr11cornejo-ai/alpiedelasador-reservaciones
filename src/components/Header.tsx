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
    <header 
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border"
      role="banner"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1 -m-1 transition-all"
          aria-label="Ir al inicio - Al Pie del Asador"
        >
          <div className="h-8 sm:h-10 flex items-center transition-transform group-hover:scale-105">
            <img 
              src={logoImage} 
              alt="" 
              className="h-full w-auto object-contain"
              role="presentation"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-semibold text-foreground leading-tight">
              Al Pie del Asador
            </h1>
          </div>
        </Link>

        <nav 
          className="flex items-center gap-2 sm:gap-3"
          aria-label="Navegación principal"
        >
          {isAdmin && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 min-h-[44px] min-w-[44px] sm:min-w-auto"
                aria-label="Panel de administración"
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Panel Admin</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout} 
                className="gap-2 min-h-[44px] min-w-[44px] sm:min-w-auto"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
