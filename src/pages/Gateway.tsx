import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Tables } from '@/integrations/supabase/types';

type ContentLink = Tables<'content_links'>;
type Advertisement = Tables<'advertisements'>;

export default function Gateway() {
  const { shortCode } = useParams();
  const [contentLink, setContentLink] = useState<ContentLink | null>(null);
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortCode) return;
    fetchContentAndAd();
  }, [shortCode]);

  useEffect(() => {
    if (countdown > 0 && contentLink && advertisement) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && contentLink) {
      trackClick();
      window.location.href = contentLink.original_url;
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
        setCountdown(0);
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
    } catch (error) {
      console.error('Error fetching content and ad:', error);
      setError('An error occurred');
      setLoading(false);
    }
  };

  const trackClick = async () => {
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
  };

  const handleAdClick = () => {
    if (advertisement) {
      window.open(advertisement.click_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !contentLink) {
    return <Navigate to="/" replace />;
  }

  const progressValue = ((5 - countdown) / 5) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {contentLink.title}
            </h1>
            {contentLink.description && (
              <p className="text-gray-600 mb-4">{contentLink.description}</p>
            )}
            <div className="text-sm text-gray-500">
              Redirecting in {countdown} seconds...
            </div>
            <Progress value={progressValue} className="mt-2" />
          </CardContent>
        </Card>

        {advertisement && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Advertisement</p>
                <div 
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onClick={handleAdClick}
                >
                  {advertisement.ad_type === 'image' && advertisement.image_url ? (
                    <img
                      src={advertisement.image_url}
                      alt={advertisement.title}
                      className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                    />
                  ) : advertisement.ad_type === 'html' && advertisement.html_content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: advertisement.html_content }}
                      className="max-w-full max-h-96 mx-auto"
                    />
                  ) : (
                    <div className="bg-gray-100 p-8 rounded-lg">
                      <h3 className="text-lg font-semibold">{advertisement.title}</h3>
                      <p className="text-gray-600 mt-2">Click to learn more</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Click the ad to visit advertiser's website
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-gray-500">
          Powered by AdLink - Monetizing content through smart advertising
        </div>
      </div>
    </div>
  );
}