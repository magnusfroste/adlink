
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type TabValue = 'providers' | 'advertisers' | 'links' | 'ads';

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('providers');
  const [contentProviders, setContentProviders] = useState<any[]>([]);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [contentLinks, setContentLinks] = useState<any[]>([]);
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [stats, setStats] = useState({ providers: 0, advertisers: 0, links: 0, ads: 0, impressions: 0, clicks: 0 });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!data) {
      toast.error('Access denied - admin only');
      navigate('/dashboard');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    fetchData();
  };

  const fetchData = async () => {
    const [providers, advs, links, ads, impressions, clicks] = await Promise.all([
      supabase.from('content_providers').select('*').order('created_at', { ascending: false }),
      supabase.from('advertisers').select('*').order('created_at', { ascending: false }),
      supabase.from('content_links').select('*').order('created_at', { ascending: false }),
      supabase.from('advertisements').select('*').order('created_at', { ascending: false }),
      supabase.from('ad_impressions').select('id', { count: 'exact', head: true }),
      supabase.from('content_clicks').select('id', { count: 'exact', head: true }),
    ]);

    setContentProviders(providers.data || []);
    setAdvertisers(advs.data || []);
    setContentLinks(links.data || []);
    setAdvertisements(ads.data || []);
    setStats({
      providers: providers.data?.length || 0,
      advertisers: advs.data?.length || 0,
      links: links.data?.length || 0,
      ads: ads.data?.length || 0,
      impressions: impressions.count || 0,
      clicks: clicks.count || 0,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'providers', label: 'Content Providers' },
    { value: 'advertisers', label: 'Advertisers' },
    { value: 'links', label: 'Content Links' },
    { value: 'ads', label: 'Advertisements' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
              <Badge variant="destructive">Admin</Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/dashboard')} variant="outline">Dashboard</Button>
              <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Content Providers', value: stats.providers },
            { label: 'Advertisers', value: stats.advertisers },
            { label: 'Links', value: stats.links },
            { label: 'Ads', value: stats.ads },
            { label: 'Impressions', value: stats.impressions },
            { label: 'Clicks', value: stats.clicks },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab buttons */}
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'hover:bg-background/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'providers' && (
          <Card>
            <CardHeader><CardTitle>Content Providers</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentProviders.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.organization_name}</TableCell>
                      <TableCell>{p.website_domain || '-'}</TableCell>
                      <TableCell>{p.contact_email || '-'}</TableCell>
                      <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {contentProviders.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No content providers yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'advertisers' && (
          <Card>
            <CardHeader><CardTitle>Advertisers</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advertisers.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.company_name}</TableCell>
                      <TableCell>{a.website_url || '-'}</TableCell>
                      <TableCell>{a.contact_email || '-'}</TableCell>
                      <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {advertisers.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No advertisers yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'links' && (
          <Card>
            <CardHeader><CardTitle>Content Links</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Short Code</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentLinks.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.title}</TableCell>
                      <TableCell><code>{l.short_code}</code></TableCell>
                      <TableCell>{l.view_count}</TableCell>
                      <TableCell>{l.click_count}</TableCell>
                      <TableCell><Badge variant={l.is_active ? 'default' : 'secondary'}>{l.is_active ? 'Yes' : 'No'}</Badge></TableCell>
                      <TableCell>{new Date(l.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {contentLinks.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No content links yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'ads' && (
          <Card>
            <CardHeader><CardTitle>Advertisements</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advertisements.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>{ad.ad_type}</TableCell>
                      <TableCell>${Number(ad.budget).toFixed(2)}</TableCell>
                      <TableCell>${Number(ad.spent).toFixed(2)}</TableCell>
                      <TableCell>{ad.view_count}</TableCell>
                      <TableCell>{ad.click_count}</TableCell>
                      <TableCell><Badge variant={ad.is_active ? 'default' : 'secondary'}>{ad.is_active ? 'Yes' : 'No'}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {advertisements.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No advertisements yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
