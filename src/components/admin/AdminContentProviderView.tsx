import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type ContentLink = Tables<'content_links'>;

export default function AdminContentProviderView() {
  const [contentLinks, setContentLinks] = useState<ContentLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllLinks();
  }, []);

  const fetchAllLinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('content_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setContentLinks(data || []);
    }
    setLoading(false);
  };

  const copyToClipboard = (shortCode: string) => {
    const shortUrl = `${window.location.origin}/g/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    toast.success('Short URL copied!');
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
          <h2 className="text-2xl font-bold text-foreground">Content Provider Dashboard (Admin View)</h2>
          <p className="text-muted-foreground">Viewing all content links across all providers</p>
        </div>
        <Button variant="outline" onClick={fetchAllLinks}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Links</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{contentLinks.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Views</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{contentLinks.reduce((s, l) => s + l.view_count, 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Clicks</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{contentLinks.reduce((s, l) => s + l.click_count, 0)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Content Links</CardTitle>
          <CardDescription>All links from all content providers</CardDescription>
        </CardHeader>
        <CardContent>
          {contentLinks.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No content links yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Short Link</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell><code className="bg-muted px-2 py-1 rounded text-sm">/g/{link.short_code}</code></TableCell>
                    <TableCell>{link.view_count}</TableCell>
                    <TableCell>{link.click_count}</TableCell>
                    <TableCell><Badge variant={link.is_active ? 'default' : 'secondary'}>{link.is_active ? 'Yes' : 'No'}</Badge></TableCell>
                    <TableCell>{new Date(link.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.short_code)}><Copy className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(link.original_url, '_blank')}><ExternalLink className="h-4 w-4" /></Button>
                      </div>
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
