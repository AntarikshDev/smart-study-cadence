import { Outlet, useLocation } from 'react-router-dom';
import { HeaderNav } from './HeaderNav';

export const MainLayout = () => {
  const location = useLocation();

  // Check if we're in focus mode (should hide header nav)
  const isFocusMode = location.pathname.includes('/focus');

  if (isFocusMode) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      
      <main className="container mx-auto px-4 py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};