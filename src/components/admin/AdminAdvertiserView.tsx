import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Advertisement = Tables<'advertisements'>;

export default function AdminAdvertiserView() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAds();
  }, []);

  const fetchAllAds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setAdvertisements(data || []);
    }
    setLoading(false);
  };

  const toggleAdStatus = async (adId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('advertisements')
      .update({ is_active: !currentActive })
      .eq('id', adId);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Advertisement ${!currentActive ? 'activated' : 'deactivated'}`);
    fetchAllAds();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Advertiser Dashboard (Admin View)</h2>
          <p className="text-muted-foreground">Viewing all advertisements across all advertisers</p>
        </div>
        <Button variant="outline" onClick={fetchAllAds}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Ads</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{advertisements.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Views</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{advertisements.reduce((s, a) => s + a.view_count, 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Clicks</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{advertisements.reduce((s, a) => s + a.click_count, 0)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Advertisements</CardTitle>
          <CardDescription>All ads from all advertisers</CardDescription>
        </CardHeader>
        <CardContent>
          {advertisements.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No advertisements yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisements.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">{ad.title}</TableCell>
                    <TableCell><Badge variant="outline">{ad.ad_type.toUpperCase()}</Badge></TableCell>
                    <TableCell><Badge variant={ad.is_active ? 'default' : 'secondary'}>{ad.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>${Number(ad.budget).toFixed(2)}</TableCell>
                    <TableCell>${Number(ad.spent).toFixed(2)}</TableCell>
                    <TableCell>{ad.view_count}</TableCell>
                    <TableCell>{ad.click_count}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => toggleAdStatus(ad.id, ad.is_active)}>
                        {ad.is_active ? 'Deactivate' : 'Activate'}
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
