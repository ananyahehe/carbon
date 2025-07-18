export interface ShareMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article';
}

export function generateShareMetadata(shareData: any): ShareMetadata {
  const improvements = shareData.improvements > 0 ? `${shareData.improvements}% improvement` : 'just started their journey';
  const footprint = Math.round(shareData.footprint / 1000 * 10) / 10;
  
  return {
    title: `${shareData.username || 'Someone'} is fighting climate change! 🌱`,
    description: `Check out this climate progress: ${footprint}t CO₂ annual footprint with ${improvements}. ${shareData.achievements} achievements unlocked and ${shareData.streak} day streak! Join the movement.`,
    image: `${window.location.origin}/api/share-image/${shareData.id}`, // Dynamic image generation endpoint
    url: window.location.href,
    type: 'website'
  };
}

export function updateMetaTags(metadata: ShareMetadata) {
  // Update document title
  document.title = metadata.title;

  // Helper function to update or create meta tags
  const updateMetaTag = (property: string, content: string, isProperty = false) => {
    const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
    let tag = document.querySelector(selector) as HTMLMetaElement;
    
    if (!tag) {
      tag = document.createElement('meta');
      if (isProperty) {
        tag.setAttribute('property', property);
      } else {
        tag.setAttribute('name', property);
      }
      document.head.appendChild(tag);
    }
    
    tag.setAttribute('content', content);
  };

  // Open Graph tags
  updateMetaTag('og:title', metadata.title, true);
  updateMetaTag('og:description', metadata.description, true);
  updateMetaTag('og:image', metadata.image, true);
  updateMetaTag('og:url', metadata.url, true);
  updateMetaTag('og:type', metadata.type, true);
  updateMetaTag('og:site_name', 'CarbonTracker', true);

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', metadata.title);
  updateMetaTag('twitter:description', metadata.description);
  updateMetaTag('twitter:image', metadata.image);
  updateMetaTag('twitter:site', '@CarbonTracker');

  // Standard meta tags
  updateMetaTag('description', metadata.description);
  updateMetaTag('keywords', 'carbon footprint, climate change, sustainability, environment, green living');
  updateMetaTag('author', 'CarbonTracker');

  // Additional social media optimization
  updateMetaTag('og:image:width', '1200', true);
  updateMetaTag('og:image:height', '630', true);
  updateMetaTag('og:image:alt', 'Climate progress visualization showing carbon footprint reduction', true);
}

export function trackShareEvent(platform: string, shareId: string) {
  // Analytics tracking - replace with your analytics service
  if (typeof gtag !== 'undefined') {
    gtag('event', 'share', {
      method: platform,
      content_type: 'progress_report',
      content_id: shareId
    });
  }
  
  // Custom analytics
  fetch('/api/analytics/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'share',
      platform,
      shareId,
      timestamp: new Date().toISOString()
    })
  }).catch(console.error);
}