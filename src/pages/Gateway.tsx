import { useEffect, useState, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';
import { ExternalLink, ArrowRight, Clock, Eye } from 'lucide-react';

type ContentLink = Tables<'content_links'>;
type Advertisement = Tables<'advertisements'>;

const AD_DURATION = 7; // seconds

export default function Gateway() {
  const { shortCode } = useParams();
  const [contentLink, setContentLink] = useState<ContentLink | null>(null);
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    if (!shortCode) return;
    fetchContentAndAd();
  }, [shortCode]);

  useEffect(() => {
    if (countdown > 0 && contentLink && advertisement) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && advertisement) {
      setCanContinue(true);
    } else if (!advertisement && contentLink) {
      // No ad available — allow immediate continue
      setCanContinue(true);
    }
  }, [countdown, contentLink, advertisement]);

  const fetchContentAndAd = async () => {
    try {
      const { data: contentData, error: contentError } = await supabase
        .from('content_links')
        .select('*')
        .eq('short_code', shortCode)
        .single();

      if (contentError || !contentData) {
        setError('Content not found');
        setLoading(false);
        return;
      }

      setContentLink(contentData);

      const { data: adData, error: adError } = await supabase
        .rpc('get_random_advertisement_for_link', { p_content_link_id: contentData.id });

      if (adError || !adData) {
        setCanContinue(true);
        setLoading(false);
        return;
      }

      setAdvertisement(adData);

      await supabase
        .from('ad_impressions')
        .insert({
          advertisement_id: adData.id,
          content_link_id: contentData.id,
          visitor_ip: null,
          user_agent: navigator.userAgent,
        });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching content and ad:', err);
      setError('An error occurred');
      setLoading(false);
    }
  };

  const handleContinue = useCallback(async () => {
    if (!contentLink) return;
    if (contentLink && advertisement) {
      await supabase
        .from('content_clicks')
        .insert({
          content_link_id: contentLink.id,
          advertisement_id: advertisement.id,
          visitor_ip: null,
          user_agent: navigator.userAgent,
        });
    }
    window.location.href = contentLink.original_url;
  }, [contentLink, advertisement]);

  const handleAdClick = () => {
    if (advertisement) {
      window.open(advertisement.click_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !contentLink) {
    return <Navigate to="/" replace />;
  }

  const progress = advertisement ? ((AD_DURATION - countdown) / AD_DURATION) * 100 : 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AdLink</span>
        </div>
        <div className="flex items-center gap-3">
          {!canContinue && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{countdown}s</span>
            </div>
          )}
          <Button
            size="sm"
            onClick={handleContinue}
            disabled={!canContinue}
            className="gap-1.5"
          >
            Continue to article
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-muted w-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full space-y-6">
          {/* Content info */}
          <div className="text-center space-y-2">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              {contentLink.title}
            </h1>
            {contentLink.description && (
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                {contentLink.description}
              </p>
            )}
          </div>

          {/* Advertisement */}
          {advertisement && (
            <Card className="overflow-hidden border-2 border-dashed border-border">
              <CardContent className="p-0">
                <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-b">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sponsored
                  </span>
                  <button
                    onClick={handleAdClick}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Visit advertiser <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
                <div
                  className="cursor-pointer transition-opacity hover:opacity-90 p-6"
                  onClick={handleAdClick}
                >
                  {advertisement.ad_type === 'image' && advertisement.image_url ? (
                    <img
                      src={advertisement.image_url}
                      alt={advertisement.title}
                      className="max-w-full max-h-80 mx-auto rounded-lg"
                    />
                  ) : advertisement.ad_type === 'html' && advertisement.html_content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: advertisement.html_content }}
                      className="max-w-full mx-auto"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold text-foreground">{advertisement.title}</h3>
                      <p className="text-muted-foreground mt-2">Click to learn more</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA when ready */}
          {canContinue && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Button size="lg" onClick={handleContinue} className="gap-2 text-base px-8">
                Continue to article
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by AdLink — Monetizing content through smart advertising
        </p>
      </footer>
    </div>
  );
}
