// Analytics utilities for tracking sharing engagement

export interface ShareAnalytics {
  shareId: string;
  platform: string;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
  location?: string;
}

export interface ShareMetrics {
  totalShares: number;
  platformBreakdown: { [platform: string]: number };
  clickThroughRate: number;
  conversionRate: number;
  topPerformingShares: string[];
}

class ShareAnalyticsService {
  private events: ShareAnalytics[] = [];

  trackShare(shareId: string, platform: string) {
    const event: ShareAnalytics = {
      shareId,
      platform,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      location: window.location.href
    };

    this.events.push(event);
    
    // Send to analytics service
    this.sendToAnalytics(event);
    
    // Store locally for offline capability
    this.storeLocally(event);
  }

  trackShareView(shareId: string) {
    const event = {
      type: 'share_view',
      shareId,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    this.sendToAnalytics(event);
  }

  trackConversion(shareId: string, action: 'signup' | 'app_open') {
    const event = {
      type: 'conversion',
      shareId,
      action,
      timestamp: new Date()
    };

    this.sendToAnalytics(event);
  }

  private async sendToAnalytics(event: any) {
    try {
      // Google Analytics 4
      if (typeof gtag !== 'undefined') {
        gtag('event', event.type || 'share', {
          custom_parameter_1: event.shareId,
          custom_parameter_2: event.platform,
          custom_parameter_3: event.action
        });
      }

      // Custom analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  private storeLocally(event: ShareAnalytics) {
    try {
      const stored = localStorage.getItem('share_analytics') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('share_analytics', JSON.stringify(events));
    } catch (error) {
      console.error('Local storage error:', error);
    }
  }

  getMetrics(): ShareMetrics {
    const platformBreakdown: { [platform: string]: number } = {};
    
    this.events.forEach(event => {
      platformBreakdown[event.platform] = (platformBreakdown[event.platform] || 0) + 1;
    });

    return {
      totalShares: this.events.length,
      platformBreakdown,
      clickThroughRate: 0, // Would be calculated from actual data
      conversionRate: 0, // Would be calculated from actual data
      topPerformingShares: [] // Would be calculated from actual data
    };
  }
}

export const shareAnalytics = new ShareAnalyticsService();

// Performance monitoring for share page load times
export function trackSharePagePerformance(shareId: string) {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        shareId,
        loadTime: perfData.loadEventEnd - perfData.fetchStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };

      shareAnalytics.sendToAnalytics({
        type: 'performance',
        ...metrics
      });
    });
  }
}