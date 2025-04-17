
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, LogIn, LogOut, Menu, Moon, Plus, Sun, User } from 'lucide-react';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch?: (searchTerm: string) => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSearch, showSearch = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Déconnecté avec succès');
    navigate('/');
  };

  return (
    <header className="w-full py-3 px-4 md:py-4 md:px-6 sticky top-0 z-10 backdrop-blur-md bg-background/90 border-b border-border">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <Film className="h-5 w-5 md:h-6 md:w-6" />
            <h1 className="text-lg md:text-xl font-semibold">StreamList</h1>
          </Link>
        </div>

        {/* Version Desktop */}
        {!isMobile && (
          <div className="flex items-center gap-4">
            {showSearch && onSearch && (
              <SearchBar onSearch={onSearch} />
            )}

            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme} 
              title={theme === 'dark' ? 'Passer au mode jour' : 'Passer au mode nuit'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50">
                  <DropdownMenuItem className="text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => navigate('/auth')}>
                <LogIn className="mr-2 h-4 w-4" />
                Connexion
              </Button>
            )}

            {isHome && user && (
              <Link
                to="/ajouter"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter un film</span>
              </Link>
            )}
          </div>
        )}

        {/* Version Mobile */}
        {isMobile && (
          <div className="flex items-center gap-2">
            {/* Bouton thème toujours visible */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="h-8 w-8"
              title={theme === 'dark' ? 'Passer au mode jour' : 'Passer au mode nuit'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Menu mobile */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px] pt-10">
                <div className="flex flex-col h-full">
                  {/* Utilisateur connecté */}
                  {user && (
                    <div className="py-4 px-2 mb-4 border-b">
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  )}

                  {/* Recherche */}
                  {showSearch && onSearch && (
                    <div className="mb-6 px-1" onClick={(e) => e.stopPropagation()}>
                      <SearchBar 
                        onSearch={onSearch} 
                      />
                    </div>
                  )}

                  {/* Navigation */}
                  <NavigationMenu orientation="vertical" className="w-full max-w-none flex-1">
                    <NavigationMenuList className="flex flex-col space-y-2 w-full items-start">
                      <NavigationMenuItem className="w-full">
                        <Link 
                          to="/"
                          className={cn(
                            "flex items-center gap-2 w-full p-2 rounded-md hover:bg-secondary",
                            location.pathname === '/' && "bg-secondary"
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Film className="h-4 w-4" />
                          <span>Accueil</span>
                        </Link>
                      </NavigationMenuItem>

                      {user && isHome && (
                        <NavigationMenuItem className="w-full">
                          <Link 
                            to="/ajouter"
                            className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-secondary text-primary"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Plus className="h-4 w-4" />
                            <span>Ajouter un film</span>
                          </Link>
                        </NavigationMenuItem>
                      )}
                    </NavigationMenuList>
                  </NavigationMenu>

                  {/* Pied de menu */}
                  <div className="mt-auto pt-4 border-t">
                    {user ? (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate('/auth');
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Connexion
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
