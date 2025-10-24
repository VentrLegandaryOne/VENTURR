# Venturr Monitoring & Error Tracking Implementation
## Production-Grade Observability Setup

**Last Updated:** October 25, 2025  
**Purpose:** Complete monitoring, logging, and error tracking for production Venturr platform

---

## Overview

This document provides implementation details for comprehensive monitoring and observability of the Venturr platform, following Google SRE best practices.

---

## Monitoring Stack

### Recommended Tools

1. **Sentry** - Error tracking and performance monitoring
2. **Google Analytics** - User behavior and traffic analytics  
3. **Uptime Robot** - Uptime monitoring and alerts
4. **LogRocket** - Session replay and frontend monitoring (optional)
5. **Grafana + Prometheus** - Metrics and dashboards (advanced)

---

## 1. Sentry Integration

### Installation

```bash
cd /home/ubuntu/venturr-production
pnpm add @sentry/node @sentry/react @sentry/tracing
```

### Backend Configuration

Create `server/_core/sentry.ts`:

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,
      integrations: [
        new ProfilingIntegration(),
      ],
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers['authorization'];
          }
        }
        return event;
      },
    });
  }
}

export { Sentry };
```

Update `server/_core/index.ts`:

```typescript
import { initSentry, Sentry } from './sentry';

// Initialize Sentry at the very beginning
initSentry();

async function startServer() {
  const app = express();
  
  // Sentry request handler must be the first middleware
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  
  // ... rest of your middleware
  
  // Sentry error handler must be before any other error middleware
  app.use(Sentry.Handlers.errorHandler());
  
  // ... rest of your code
}
```

### Frontend Configuration

Create `client/src/lib/sentry.ts`:

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter PII
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  }
}
```

Update `client/src/main.tsx`:

```typescript
import { initSentry } from './lib/sentry';

// Initialize Sentry before React
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Custom Error Tracking

```typescript
import { Sentry } from './lib/sentry';

// Track custom errors
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      operation: 'labor_calculation',
      area: 'calculator',
    },
    extra: {
      roofArea: 150,
      complexity: 'standard',
    },
  });
  throw error;
}

// Track custom events
Sentry.captureMessage('Quote generated successfully', {
  level: 'info',
  tags: {
    feature: 'quote_generator',
  },
});
```

---

## 2. Google Analytics

### Installation

```bash
pnpm add react-ga4
```

### Configuration

Create `client/src/lib/analytics.ts`:

```typescript
import ReactGA from 'react-ga4';

export function initAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (measurementId) {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        anonymizeIp: true,
      },
    });
  }
}

export function trackPageView(path: string) {
  ReactGA.send({ hitType: 'pageview', page: path });
}

export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
) {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}

// Custom events for Venturr
export const analytics = {
  projectCreated: () => trackEvent('Project', 'Created'),
  calculationPerformed: (type: string) => 
    trackEvent('Calculator', 'Calculation', type),
  quoteGenerated: (value: number) => 
    trackEvent('Quote', 'Generated', undefined, value),
  materialSelected: (material: string) => 
    trackEvent('Material', 'Selected', material),
  crewSelected: (crew: string) => 
    trackEvent('Crew', 'Selected', crew),
};
```

### Usage in Components

```typescript
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackPageView, analytics } from '@/lib/analytics';

function Calculator() {
  const [location] = useLocation();
  
  useEffect(() => {
    trackPageView(location);
  }, [location]);
  
  const handleCalculate = () => {
    // ... calculation logic
    analytics.calculationPerformed('labor');
  };
  
  return (
    // ... component JSX
  );
}
```

---

## 3. Uptime Monitoring

### Uptime Robot Setup

1. **Create Account:** https://uptimerobot.com
2. **Add Monitor:**
   - Type: HTTP(s)
   - URL: https://your-domain.com/api/health
   - Interval: 5 minutes
   - Alert Contacts: Your email/SMS

### Health Endpoint

Create `server/routers/health.ts`:

```typescript
import { publicProcedure, router } from '../_core/trpc';
import { db } from '../_core/db';

export const healthRouter = router({
  check: publicProcedure.query(async () => {
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: 'unknown',
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    };
    
    // Check database connection
    try {
      await db.select().from(projects).limit(1);
      checks.database = 'connected';
    } catch (error) {
      checks.database = 'disconnected';
      checks.status = 'degraded';
    }
    
    return checks;
  }),
});
```

Add to main router:

```typescript
export const appRouter = router({
  // ... existing routers
  health: healthRouter,
});
```

---

## 4. Application Performance Monitoring

### Custom Performance Tracking

Create `client/src/lib/performance.ts`:

```typescript
export class PerformanceMonitor {
  private static marks = new Map<string, number>();
  
  static mark(name: string) {
    this.marks.set(name, performance.now());
  }
  
  static measure(name: string, startMark: string) {
    const start = this.marks.get(startMark);
    if (!start) return;
    
    const duration = performance.now() - start;
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration),
        event_category: 'Performance',
      });
    }
    
    // Send to Sentry
    if (window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'performance',
        message: `${name}: ${duration.toFixed(2)}ms`,
        level: 'info',
      });
    }
    
    this.marks.delete(startMark);
    return duration;
  }
}

// Usage
PerformanceMonitor.mark('calculation_start');
const result = await calculateLaborCost(...);
PerformanceMonitor.measure('Labor Calculation', 'calculation_start');
```

### Web Vitals Tracking

```bash
pnpm add web-vitals
```

Create `client/src/lib/vitals.ts`:

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import { Sentry } from './sentry';

function sendToAnalytics({ name, delta, id }: any) {
  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(delta),
      event_label: id,
      non_interaction: true,
    });
  }
  
  // Send to Sentry
  Sentry.captureMessage(`Web Vital: ${name}`, {
    level: 'info',
    tags: { metric: name },
    extra: { value: delta, id },
  });
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

---

## 5. Logging Strategy

### Structured Logging

```bash
pnpm add winston
```

Create `server/_core/logger.ts`:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'venturr-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export { logger };
```

### Usage

```typescript
import { logger } from '../_core/logger';

// Info logging
logger.info('Labor calculation performed', {
  userId: user.id,
  roofArea: 150,
  complexity: 'standard',
  result: totalCost,
});

// Error logging
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  context: 'project_creation',
});

// Warning logging
logger.warn('High calculation time detected', {
  duration: 5000,
  threshold: 1000,
});
```

---

## 6. Metrics Dashboard

### Key Metrics to Track

**Business Metrics:**
- Projects created per day
- Calculations performed per day
- Quotes generated per day
- Average quote value
- User retention rate

**Technical Metrics:**
- API response time (p50, p95, p99)
- Error rate
- Database query time
- Memory usage
- CPU usage
- Active users

**User Experience Metrics:**
- Page load time
- Time to interactive
- Core Web Vitals (LCP, FID, CLS)
- Bounce rate
- Session duration

### Custom Metrics Endpoint

Create `server/routers/metrics.ts`:

```typescript
import { protectedProcedure, router } from '../_core/trpc';
import { db } from '../_core/db';

export const metricsRouter = router({
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const [
      projectCount,
      calculationCount,
      quoteCount,
    ] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(projects),
      db.select({ count: sql`count(*)` }).from(takeoffs),
      db.select({ count: sql`count(*)` }).from(quotes),
    ]);
    
    return {
      projects: projectCount[0].count,
      calculations: calculationCount[0].count,
      quotes: quoteCount[0].count,
      timestamp: new Date().toISOString(),
    };
  }),
});
```

---

## 7. Alerts Configuration

### Alert Triggers

**Critical (Immediate Action):**
- Server down >5 minutes
- Error rate >10%
- Database connection lost
- Disk space <10%

**Warning (Monitor Closely):**
- Error rate >5%
- Response time >2s (p95)
- Memory usage >80%
- Disk space <20%

**Info (Track Trends):**
- Unusual traffic patterns
- High calculation volumes
- New user signups

### Sentry Alerts

1. Go to Sentry → Alerts → Create Alert
2. Configure:
   - Condition: Error count >10 in 5 minutes
   - Action: Email + Slack notification
   - Environment: Production only

### Uptime Robot Alerts

1. Configure in Uptime Robot dashboard
2. Alert Contacts:
   - Email: your-email@domain.com
   - SMS: +61 XXX XXX XXX
   - Slack webhook: https://hooks.slack.com/...

---

## 8. Environment Variables

Add to `.env`:

```env
# Monitoring
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
LOG_LEVEL=info

# Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
ALERT_EMAIL=alerts@venturr.com.au
```

---

## 9. Testing Monitoring

### Test Error Tracking

```typescript
// Trigger test error
import { Sentry } from './lib/sentry';

Sentry.captureException(new Error('Test error from Venturr'));
```

### Test Analytics

```typescript
// Trigger test event
import { analytics } from './lib/analytics';

analytics.projectCreated();
```

### Test Health Endpoint

```bash
curl https://your-domain.com/api/health
```

---

## 10. Monitoring Checklist

### Pre-Launch

- [ ] Sentry configured (backend + frontend)
- [ ] Google Analytics installed
- [ ] Uptime monitoring active
- [ ] Health endpoint working
- [ ] Alerts configured
- [ ] Logging implemented
- [ ] Error tracking tested

### Post-Launch

- [ ] Monitor error rates daily
- [ ] Review performance metrics weekly
- [ ] Check uptime reports weekly
- [ ] Analyze user behavior monthly
- [ ] Review and optimize alerts quarterly

---

## Conclusion

With this monitoring setup, you'll have:
- ✅ Real-time error tracking
- ✅ Performance monitoring
- ✅ Uptime alerts
- ✅ User behavior insights
- ✅ Comprehensive logging
- ✅ Actionable metrics

**Estimated Setup Time:** 2-3 hours  
**Monthly Cost:** $0-50 (free tiers available)

---

**Next Steps:** Implement monitoring → Test alerts → Launch to production

