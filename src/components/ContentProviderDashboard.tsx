import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Copy, ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';
import CounterMonitor from './CounterMonitor';
import CategoryPicker, { CategoryBadges } from './CategoryPicker';
import { useCategories, saveContentLinkCategories, getContentLinkCategoryIds, saveBlockedCategories, getBlockedCategoryIds } from '@/hooks/useCategories';
import type { Tables } from '@/integrations/supabase/types';

type ContentLink = Tables<'content_links'>;

export default function ContentProviderDashboard() {
  const [contentLinks, setContentLinks] = useState<ContentLink[]>([]);
  const [linkCategories, setLinkCategories] = useState<Record<string, string[]>>({});
  const [blockedCategories, setBlockedCategories] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBlocked, setSelectedBlocked] = useState<string[]>([]);
  const [brandSafetyLinkId, setBrandSafetyLinkId] = useState<string | null>(null);
  const [brandSafetyBlocked, setBrandSafetyBlocked] = useState<string[]>([]);
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    originalUrl: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchContentLinks();
  }, []);

  const fetchContentLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: provider } = await supabase
        .from('content_providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!provider) return;

      const { data, error } = await supabase
        .from('content_links')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(error.message);
        return;
      }

      const links = data || [];
      setContentLinks(links);

      // Fetch categories and blocked categories for all links
      const catMap: Record<string, string[]> = {};
      const blockedMap: Record<string, string[]> = {};
      await Promise.all(links.map(async (link) => {
        const [cats, blocked] = await Promise.all([
          getContentLinkCategoryIds(link.id),
          getBlockedCategoryIds(link.id),
        ]);
        catMap[link.id] = cats;
        blockedMap[link.id] = blocked;
      }));
      setLinkCategories(catMap);
      setBlockedCategories(blockedMap);
    } catch (error) {
      toast.error('Failed to fetch content links');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContentLinks();
  };

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: provider } = await supabase
        .from('content_providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!provider) return;

      const shortCode = generateShortCode();

      const { data: newLink, error } = await supabase
        .from('content_links')
        .insert({
          provider_id: provider.id,
          original_url: formData.originalUrl,
          short_code: shortCode,
          title: formData.title,
          description: formData.description || null,
        })
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      if (newLink && selectedCategories.length > 0) {
        await saveContentLinkCategories(newLink.id, selectedCategories);
      }
      if (newLink && selectedBlocked.length > 0) {
        await saveBlockedCategories(newLink.id, selectedBlocked);
      }

      toast.success('Short link created successfully!');
      setFormData({ originalUrl: '', title: '', description: '' });
      setSelectedCategories([]);
      setSelectedBlocked([]);
      setIsDialogOpen(false);
      fetchContentLinks();
    } catch (error) {
      toast.error('Failed to create short link');
    } finally {
      setLoading(false);
    }
  };

  const openBrandSafety = (linkId: string) => {
    setBrandSafetyLinkId(linkId);
    setBrandSafetyBlocked(blockedCategories[linkId] || []);
  };

  const saveBrandSafety = async () => {
    if (!brandSafetyLinkId) return;
    await saveBlockedCategories(brandSafetyLinkId, brandSafetyBlocked);
    toast.success('Brand safety settings saved!');
    setBrandSafetyLinkId(null);
    fetchContentLinks();
  };

  const copyToClipboard = (shortCode: string) => {
    const shortUrl = `${window.location.origin}/g/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    toast.success('Short URL copied to clipboard!');
  };

  if (loading && contentLinks.length === 0) {
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
          <h2 className="text-3xl font-bold text-foreground">Content Provider Dashboard</h2>
          <p className="text-muted-foreground">Manage your content links and track performance</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Short Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Short Link</DialogTitle>
                <DialogDescription>
                  Convert your content URL into a shareable ad-supported link
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLink} className="space-y-4">
                <div>
                  <Label htmlFor="originalUrl">Original URL</Label>
                  <Input
                    id="originalUrl"
                    type="url"
                    value={formData.originalUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalUrl: e.target.value }))}
                    placeholder="https://yoursite.com/article/..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Article title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the content"
                  />
                </div>
                <div>
                  <Label>Categories</Label>
                  <CategoryPicker selected={selectedCategories} onChange={setSelectedCategories} />
                </div>
                <div>
                  <Label>🛡️ Blocked Ad Categories (Brand Safety)</Label>
                  <p className="text-xs text-muted-foreground mb-2">Ads in these categories will NOT be shown on this link</p>
                  <CategoryPicker selected={selectedBlocked} onChange={setSelectedBlocked} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Short Link'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentLinks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentLinks.reduce((sum, link) => sum + link.view_count, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentLinks.reduce((sum, link) => sum + link.click_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Counter Monitor */}
      <CounterMonitor />

      {/* Content Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Content Links</CardTitle>
          <CardDescription>Manage and track your ad-supported content links</CardDescription>
        </CardHeader>
        <CardContent>
          {contentLinks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No content links created yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Blocked</TableHead>
                  <TableHead>Short Link</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell>
                      <CategoryBadges categoryIds={linkCategories[link.id] || []} categories={categories} />
                    </TableCell>
                    <TableCell>
                      <CategoryBadges categoryIds={blockedCategories[link.id] || []} categories={categories} />
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">/g/{link.short_code}</code>
                    </TableCell>
                    <TableCell>{link.view_count}</TableCell>
                    <TableCell>{link.click_count}</TableCell>
                    <TableCell>{new Date(link.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openBrandSafety(link.id)} title="Brand Safety">
                          <ShieldAlert className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.short_code)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(link.original_url, '_blank')}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Brand Safety Dialog */}
      <Dialog open={!!brandSafetyLinkId} onOpenChange={(open) => !open && setBrandSafetyLinkId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🛡️ Brand Safety Settings</DialogTitle>
            <DialogDescription>
              Select ad categories to block from showing on this content link
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <CategoryPicker selected={brandSafetyBlocked} onChange={setBrandSafetyBlocked} />
            <Button onClick={saveBrandSafety} className="w-full">Save Brand Safety Settings</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
