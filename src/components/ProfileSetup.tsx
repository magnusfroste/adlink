
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface ProfileSetupProps {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [userType, setUserType] = useState<'content_provider' | 'advertiser'>('content_provider');
  const [formData, setFormData] = useState({
    organizationName: '',
    websiteDomain: '',
    companyName: '',
    websiteUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('User not found');
        return;
      }

      if (userType === 'content_provider') {
        const { error } = await supabase
          .from('content_providers')
          .insert({
            user_id: user.id,
            organization_name: formData.organizationName,
            website_domain: formData.websiteDomain,
            contact_email: user.email,
          });

        if (error) {
          toast.error(error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from('advertisers')
          .insert({
            user_id: user.id,
            company_name: formData.companyName,
            contact_email: user.email,
            website_url: formData.websiteUrl,
          });

        if (error) {
          toast.error(error.message);
          return;
        }
      }

      toast.success('Profile created successfully!');
      onComplete();
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide some information to set up your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Account Type</Label>
              <RadioGroup value={userType} onValueChange={(value: 'content_provider' | 'advertiser') => setUserType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="content_provider" id="content_provider" />
                  <Label htmlFor="content_provider">Content Provider</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advertiser" id="advertiser" />
                  <Label htmlFor="advertiser">Advertiser</Label>
                </div>
              </RadioGroup>
            </div>

            {userType === 'content_provider' ? (
              <>
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    placeholder="e.g., Tech News Daily"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="websiteDomain">Website Domain</Label>
                  <Input
                    id="websiteDomain"
                    value={formData.websiteDomain}
                    onChange={(e) => handleInputChange('websiteDomain', e.target.value)}
                    placeholder="e.g., technewsdaily.com"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="e.g., Tech Solutions Inc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    placeholder="https://techsolutions.com"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
