import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '../components/ProfileForm';
import { useAuthStore } from '../utils/auth-store';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black"
          >
            Sign Out
          </Button>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
