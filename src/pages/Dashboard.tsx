
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ContentProviderDashboard from '@/components/ContentProviderDashboard';
import AdvertiserDashboard from '@/components/AdvertiserDashboard';
import ProfileSetup from '@/components/ProfileSetup';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'content_provider' | 'advertiser' | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has a content provider profile
      const { data: contentProvider } = await supabase
        .from('content_providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (contentProvider) {
        setUserType('content_provider');
        setHasProfile(true);
        setLoading(false);
        return;
      }

      // Check if user has an advertiser profile
      const { data: advertiser } = await supabase
        .from('advertisers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (advertiser) {
        setUserType('advertiser');
        setHasProfile(true);
        setLoading(false);
        return;
      }

      // No profile found, need to set up
      setHasProfile(false);
      setLoading(false);
    } catch (error) {
      console.error('Error checking user profile:', error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasProfile) {
    return <ProfileSetup onComplete={checkUserProfile} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">AdLink Dashboard</h1>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userType === 'content_provider' ? (
          <ContentProviderDashboard />
        ) : (
          <AdvertiserDashboard />
        )}
      </main>
    </div>
  );
}
