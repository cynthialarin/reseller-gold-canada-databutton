import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../utils/auth-store';
import { Home, Plus, List, Settings, LogOut, Search, BarChart, Package } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export function Layout({ children }: Props) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => navigate('/')}
              >
                <Home className="h-5 w-5" />
                <span className="ml-2">Home</span>
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => navigate('/create-listing')}
              >
                <Plus className="h-5 w-5" />
                <span className="ml-2">Create Listing</span>
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => navigate('/Inventory')}
              >
                <Package className="h-5 w-5" />
                <span className="ml-2">Inventory</span>
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => navigate('/price-analysis')}
              >
                <Search className="h-5 w-5" />
                <span className="ml-2">Price Analysis</span>
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => navigate('/analytics')}
              >
                <BarChart className="h-5 w-5" />
                <span className="ml-2">Analytics</span>
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => navigate('/listings')}
              >
                <List className="h-5 w-5" />
                <span className="ml-2">My Listings</span>
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-5 w-5" />
                <span className="ml-2">Settings</span>
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
