# Release Checklist - Venturr Platform

This checklist must be completed before any production deployment.

## Release Engineering Owner: @VentrLegandaryOne
## QA Verification: @VentrLegandaryOne

---

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All TypeScript type checks pass (`pnpm check`)
- [ ] Code linting passes (`pnpm format`)
- [ ] No critical security vulnerabilities in dependencies

### 2. Testing
- [ ] All unit tests pass (`pnpm test`)
- [ ] E2E smoke tests pass (`pnpm test:e2e`)
- [ ] Measurement workflow E2E tests pass
- [ ] Manual QA of critical user flows

### 3. Security (P0 Requirements)
- [ ] CSRF protection enabled and tested
- [ ] Rate limiting configured for API endpoints
- [ ] Helmet security headers applied
- [ ] CORS settings configured for production domains
- [ ] No sensitive data exposed in logs or responses
- [ ] Environment variables properly configured

### 4. Infrastructure
- [ ] Environment variables set:
  - [ ] `VITE_MAPBOX_TOKEN` - Mapbox API token
  - [ ] `SENDGRID_API_KEY` - SendGrid API key
  - [ ] `SENDGRID_FROM_EMAIL` - Verified sender email
  - [ ] `JWT_SECRET` - Strong secret for JWT signing
  - [ ] `ALLOWED_ORIGINS` - Production domain(s)
  - [ ] `DATABASE_URL` - Production database connection

### 5. Feature Verification

#### Mapbox Integration
- [ ] Satellite tiles load correctly
- [ ] Address search/geocoding works
- [ ] Drawing tools functional (polygon, rectangle, polyline)
- [ ] Measurements calculated accurately

#### Email System
- [ ] Quote emails send successfully
- [ ] Welcome emails send successfully  
- [ ] Verification emails send successfully
- [ ] Email templates render correctly

#### Core Workflows
- [ ] User authentication works
- [ ] Project creation works
- [ ] Measurement workflow completes
- [ ] Quote generation works
- [ ] PDF export functional

---

## Deployment Steps

### Canary Deployment
1. Deploy to staging/canary environment
2. Run smoke tests against canary
3. Verify health check endpoint responds
4. Monitor error rates for 15 minutes
5. If stable, proceed to production

### Production Deployment
1. Create deployment tag: `git tag -a v1.x.x -m "Release v1.x.x"`
2. Deploy to production
3. Verify health check: `curl https://yourdomain.com/api/health`
4. Run production smoke tests
5. Monitor error rates and performance

---

## Post-Deployment Verification

- [ ] Health check endpoint returns `healthy`
- [ ] No spike in error rates
- [ ] Core user flows working
- [ ] Mapbox satellite tiles loading
- [ ] Email delivery functional

---

## Rollback Procedure

If critical issues are discovered:

1. Identify the issue scope
2. If widespread: rollback immediately
3. Rollback command: `[deployment platform rollback command]`
4. Verify rollback successful
5. Create incident report
6. Fix forward with patch release

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Release Engineer | | | |
| QA Lead | | | |
| Product Owner | | | |

---

*Last Updated: 2024*
