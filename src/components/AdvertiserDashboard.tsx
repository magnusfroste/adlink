
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface Advertisement {
  id: string;
  title: string;
  ad_type: 'image' | 'html';
  image_url: string | null;
  html_content: string | null;
  click_url: string;
  status: 'active' | 'inactive' | 'pending';
  views_count: number;
  clicks_count: number;
  created_at: string;
}

export default function AdvertiserDashboard() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    adType: 'image' as 'image' | 'html',
    imageUrl: '',
    htmlContent: '',
    clickUrl: '',
  });

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: advertiser } = await supabase
        .from('advertisers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!advertiser) return;

      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('advertiser_id', advertiser.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(error.message);
        return;
      }

      setAdvertisements(data || []);
    } catch (error) {
      toast.error('Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: advertiser } = await supabase
        .from('advertisers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!advertiser) return;

      const { error } = await supabase
        .from('advertisements')
        .insert({
          advertiser_id: advertiser.id,
          title: formData.title,
          ad_type: formData.adType,
          image_url: formData.adType === 'image' ? formData.imageUrl : null,
          html_content: formData.adType === 'html' ? formData.htmlContent : null,
          click_url: formData.clickUrl,
          status: 'active',
        });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Advertisement created successfully!');
      setFormData({
        title: '',
        adType: 'image',
        imageUrl: '',
        htmlContent: '',
        clickUrl: '',
      });
      setIsDialogOpen(false);
      fetchAdvertisements();
    } catch (error) {
      toast.error('Failed to create advertisement');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdStatus = async (adId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    const { error } = await supabase
      .from('advertisements')
      .update({ status: newStatus })
      .eq('id', adId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Advertisement ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    fetchAdvertisements();
  };

  if (loading && advertisements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advertiser Dashboard</h2>
          <p className="text-gray-600">Manage your advertisements and track performance</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Advertisement</DialogTitle>
              <DialogDescription>
                Create a new ad that will be shown to content viewers
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAd} className="space-y-4">
              <div>
                <Label htmlFor="title">Advertisement Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="My Advertisement"
                  required
                />
              </div>
              
              <div>
                <Label>Advertisement Type</Label>
                <Select 
                  value={formData.adType} 
                  onValueChange={(value: 'image' | 'html') => setFormData(prev => ({ ...prev, adType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image Advertisement</SelectItem>
                    <SelectItem value="html">HTML Advertisement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.adType === 'image' ? (
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/ad-image.jpg"
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="htmlContent">HTML Content</Label>
                  <Textarea
                    id="htmlContent"
                    value={formData.htmlContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                    placeholder="<div>Your HTML ad content here...</div>"
                    rows={6}
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="clickUrl">Click URL</Label>
                <Input
                  id="clickUrl"
                  type="url"
                  value={formData.clickUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, clickUrl: e.target.value }))}
                  placeholder="https://yoursite.com/landing-page"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Advertisement'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advertisements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advertisements.reduce((sum, ad) => sum + ad.views_count, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advertisements.reduce((sum, ad) => sum + ad.clicks_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advertisements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Advertisements</CardTitle>
          <CardDescription>
            Manage and track your advertisement performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {advertisements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No advertisements created yet</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Your First Ad</Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisements.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">{ad.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ad.ad_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={ad.status === 'active' ? 'default' : 'secondary'}
                      >
                        {ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{ad.views_count}</TableCell>
                    <TableCell>{ad.clicks_count}</TableCell>
                    <TableCell>
                      {new Date(ad.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAdStatus(ad.id, ad.status)}
                      >
                        {ad.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
