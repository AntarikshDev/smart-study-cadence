import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Timer, 
  Calendar, 
  BarChart3, 
  Trophy, 
  Settings, 
  Bell, 
  User,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Focus Mode', href: '/focus', icon: Timer },
  { name: 'Planner', href: '/planner', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Leaderboards', href: '/leaderboards', icon: Trophy },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const HeaderNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">RP</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Revision Planner</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Student Edition</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex items-center space-x-1 ml-8 hidden lg:flex">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Button
                key={item.name}
                variant="ghost"
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
                  active 
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                    : "hover:bg-blue-50 hover:text-blue-600"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.name}</span>
              </Button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Current time */}
          <div className="hidden md:block text-right">
            <p className="text-xs text-muted-foreground">
              {currentTime}
            </p>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              2
            </Badge>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Student</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="container py-4">
            <div className="grid grid-cols-2 gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    onClick={() => {
                      navigate(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-start space-x-2 px-3 py-2 rounded-lg",
                      active 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "hover:bg-blue-50 hover:text-blue-600"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Button>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};