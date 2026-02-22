# VENTURR VALDT - CI/CD Pipeline Documentation

**Document Version:** 1.0  
**Last Updated:** December 31, 2025

---

## Overview

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for VENTURR VALDT. The platform uses Manus's built-in deployment infrastructure with automated testing, building, and deployment workflows.

---

## Pipeline Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Develop   │───▶│    Test     │───▶│    Build    │───▶│   Deploy    │
│             │    │             │    │             │    │             │
│ Code Change │    │ Unit Tests  │    │ Vite Build  │    │ Production  │
│ Checkpoint  │    │ E2E Tests   │    │ Bundle      │    │ Publish     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Environments

| Environment | Purpose | URL Pattern | Auto-Deploy |
|-------------|---------|-------------|-------------|
| Development | Active development | `*-dev.manus.space` | On save |
| Preview | Checkpoint review | `*-preview.manus.space` | On checkpoint |
| Production | Live users | `*.manus.space` or custom domain | Manual publish |

---

## Pipeline Stages

### Stage 1: Development

**Trigger:** Code changes in sandbox

**Actions:**
1. TypeScript compilation (real-time)
2. ESLint validation
3. Hot module replacement
4. Development server restart

**Tools:**
- Vite dev server with HMR
- TypeScript compiler in watch mode
- ESLint for code quality

### Stage 2: Testing

**Trigger:** Before checkpoint save

**Actions:**
1. Run unit tests (`pnpm test`)
2. Run integration tests
3. Run E2E tests
4. Generate coverage report

**Test Suite:**

| Test Type | Count | Framework | Coverage |
|-----------|-------|-----------|----------|
| Unit Tests | 200+ | Vitest | 85%+ |
| Integration | 50+ | Vitest | Core flows |
| E2E | 10+ | Vitest | Critical paths |

**Commands:**
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm vitest run server/quotes.test.ts

# Run with coverage
pnpm vitest run --coverage
```

### Stage 3: Build

**Trigger:** Checkpoint creation

**Actions:**
1. Production build (`pnpm build`)
2. Bundle optimization
3. Asset compression
4. Source map generation

**Build Configuration:**

```typescript
// vite.config.ts optimizations
{
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'trpc-vendor': ['@trpc/client', '@trpc/react-query'],
          'ui-vendor': ['@radix-ui/*'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'animation': ['framer-motion']
        }
      }
    }
  }
}
```

**Build Metrics:**

| Metric | Target | Current |
|--------|--------|---------|
| Bundle Size (gzip) | <300KB | 207KB |
| Build Time | <30s | ~20s |
| Chunk Count | <20 | 15 |

### Stage 4: Deployment

**Trigger:** Manual publish via UI

**Actions:**
1. Validate checkpoint integrity
2. Deploy to production infrastructure
3. Database migration (if needed)
4. Cache invalidation
5. Health check verification

**Deployment Checklist:**
- [ ] All tests passing
- [ ] Checkpoint saved
- [ ] Database migrations reviewed
- [ ] Environment variables configured
- [ ] Health checks passing

---

## Database Migrations

### Migration Workflow

```bash
# Generate migration from schema changes
pnpm db:push

# This runs:
# 1. drizzle-kit generate
# 2. drizzle-kit migrate
```

### Migration Best Practices

1. **Always backup before migration**
2. **Test migrations in development first**
3. **Use incremental changes** - avoid large schema changes
4. **Document breaking changes** - update API docs if needed

### Rollback Procedure

1. Identify the problematic migration
2. Use `webdev_rollback_checkpoint` to restore previous state
3. Fix migration issues
4. Re-deploy with corrected migration

---

## Environment Variables

### Required Variables (Auto-injected)

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | Database connection | Manus Platform |
| `JWT_SECRET` | Session signing | Manus Platform |
| `VITE_APP_ID` | OAuth app ID | Manus Platform |
| `BUILT_IN_FORGE_API_KEY` | LLM/Storage API | Manus Platform |

### Custom Variables

Custom environment variables can be added via:
1. Settings → Secrets panel in Management UI
2. `webdev_request_secrets` tool for new secrets
3. `webdev_edit_secrets` tool for updates

---

## Monitoring and Alerts

### Health Checks

| Endpoint | Frequency | Timeout |
|----------|-----------|---------|
| `/api/health` | 30s | 5s |
| `/api/trpc/health` | 60s | 10s |
| Database ping | 60s | 5s |

### Error Tracking

- **Provider:** Sentry (configured)
- **Alert Threshold:** 5 errors/minute
- **Notification:** Slack + Email

### Performance Monitoring

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Response Time | >3s | Warning |
| Error Rate | >1% | Critical |
| Memory Usage | >80% | Warning |
| CPU Usage | >90% | Critical |

---

## Rollback Procedures

### Application Rollback

1. Open Management UI → Dashboard
2. Find previous checkpoint
3. Click "Rollback" button
4. Confirm rollback
5. Verify service restoration

### Database Rollback

1. Access TiDB console
2. Initiate point-in-time recovery
3. Select recovery timestamp
4. Verify data integrity
5. Update application connections

---

## Security Considerations

### Secrets Management

- Never commit secrets to code
- Use environment variables for all credentials
- Rotate secrets quarterly
- Audit secret access logs

### Code Security

- Automated dependency scanning
- Input validation on all endpoints
- SQL injection prevention (Drizzle ORM)
- XSS prevention (React default escaping)

### Deployment Security

- HTTPS enforced
- Security headers configured
- Rate limiting active
- WAF protection (Manus infrastructure)

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails | TypeScript errors | Fix type errors, check imports |
| Tests fail | Code regression | Review failing tests, fix code |
| Deploy stuck | Infrastructure issue | Check status page, retry |
| 500 errors | Runtime exception | Check Sentry, review logs |

### Debug Commands

```bash
# Check TypeScript errors
pnpm tsc --noEmit

# Run specific test
pnpm vitest run <test-file>

# Check bundle size
pnpm build && ls -la dist/

# View server logs
# Available in Management UI → Dashboard
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 31, 2025 | Initial documentation |

---

*For questions about the CI/CD pipeline, contact the VENTURR VALDT development team.*
