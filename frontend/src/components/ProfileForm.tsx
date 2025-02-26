import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '../utils/auth-store';

export function ProfileForm() {
  const { profile, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    business_name: profile?.business_name || '',
    preferred_marketplaces: profile?.preferred_marketplaces || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error?.message || error?.error_description || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const marketplaceOptions = ['Facebook Marketplace', 'Poshmark', 'eBay', 'Etsy'];

  const toggleMarketplace = (marketplace: string) => {
    const current = formData.preferred_marketplaces || [];
    const updated = current.includes(marketplace)
      ? current.filter(m => m !== marketplace)
      : [...current, marketplace];
    
    setFormData(prev => ({
      ...prev,
      preferred_marketplaces: updated,
    }));
  };

  return (
    <Card className="w-full max-w-2xl p-6 bg-gray-900 border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <p className="text-gray-400">
            Update your profile information and preferences
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Username
            </label>
            <Input
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Full Name
            </label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Business Name
            </label>
            <Input
              value={formData.business_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, business_name: e.target.value }))
              }
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Preferred Marketplaces
            </label>
            <div className="flex flex-wrap gap-2">
              {marketplaceOptions.map((marketplace) => (
                <Button
                  key={marketplace}
                  type="button"
                  variant={formData.preferred_marketplaces?.includes(marketplace) ? 'default' : 'outline'}
                  onClick={() => toggleMarketplace(marketplace)}
                  className={formData.preferred_marketplaces?.includes(marketplace) 
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'border-white text-white hover:bg-white hover:text-black'}
                >
                  {marketplace}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-gray-200"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Card>
  );
}
