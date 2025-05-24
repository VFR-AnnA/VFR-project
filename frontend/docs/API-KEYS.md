# API Key Security Implementation

This document outlines the implementation of the "zero-leak" approach for handling API keys for Meshy and Hunyuan 3D generation services.

## Key Overview

| Key name   | Environment Variable | Access                     | Format Example    |
|------------|----------------------|----------------------------|-------------------|
| Meshy      | `MESHY_KEY`          | Edge/server functions only | `msy_live_xxxxx`  |
| Hunyuan 3D | `HY3D_KEY`           | Edge/server functions only | `hy_live_xxxxx`   |

## Critical Implementation Requirements

### 1. Runtime Environment

All API routes that use provider keys **MUST** use the Node.js runtime:

```typescript
// Force Node.js runtime to ensure environment variables work correctly
export const runtime = 'nodejs';
```

**IMPORTANT**: Edge runtime does not properly expose environment variables, causing authentication failures.

### 2. Environment Variables

Keys must be properly configured in all environments:

**Local Development (.env.local)**
```
MESHY_KEY=msy_live_XXXXX
HY3D_KEY=hy_live_YYYYY
GEN_PROVIDER=meshy
HY3D_REGION=cn-shenzhen
```

**Vercel/Hosting Platform**
- Add both keys as environment variables in your hosting dashboard
- Set `HY3D_REGION` for Hunyuan (usually `cn-shenzhen` or `ap-shanghai`)
- No `NEXT_PUBLIC_` prefix (server-side only)

**GitHub Actions**
- Add both keys as repository or organization-level secrets
- Configure workflow to expose them:
  ```yaml
  env:
    MESHY_KEY: ${{ secrets.MESHY_KEY }}
    HY3D_KEY: ${{ secrets.HY3D_KEY }}
    GEN_PROVIDER: meshy
  ```

### 3. API Headers

The providers require specific headers:

**Meshy**
```typescript
headers: {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
}
```

**Hunyuan**
```typescript
headers: {
  'X-Api-Key': apiKey,
  'X-Api-Region': region
}
```

## Architecture

The implementation follows these security principles:
- Keys are never exposed to the browser
- Keys are only accessible from server-side code
- Keys are stored securely in environment variables
- Keys are accessed through a centralized provider
- Error messages are sanitized to prevent leaking sensitive information

## Implementation Details

### SecureKeyProvider

All API key access goes through the centralized `SecureKeyProvider` module which:
- Provides controlled access to sensitive keys
- Validates key format and availability
- Offers a safe verification method for CI

### Provider Adapters

Provider implementations (Meshy and Hunyuan) access keys only through the `SecureKeyProvider`.

### Error Handling

All API error messages are sanitized to prevent leaking sensitive information:
- Key values are stripped from error messages
- Generic error messages are used for authentication failures
- Detailed errors are logged server-side only, never exposed to clients

## Troubleshooting

If you encounter authentication issues:

1. **Check runtime**: All API routes must use the Node.js runtime
   ```typescript
   export const runtime = 'nodejs';
   ```

2. **Verify environment variables**:
   - Run `node scripts/test-production-performance.js` to validate keys
   - Check for whitespace or newlines in keys
   - Ensure keys follow the correct format

3. **Hunyuan region**: 
   - If Hunyuan fails, try different regions (`cn-shenzhen`, `ap-shanghai`, `ap-beijing`, `ap-guangzhou`)
   - Update `HY3D_REGION` in all environments

4. **Restart servers**:
   - After updating `.env.local`, restart your Next.js server
   - After updating Vercel environment variables, redeploy

5. **Quick API validation**:
   ```bash
   # Test Meshy API
   curl -H "Authorization: Bearer $MESHY_KEY" https://api.meshy.ai/ping

   # Test Hunyuan API
   curl -H "X-Api-Key: $HY3D_KEY" -H "X-Api-Region: cn-shenzhen" https://hunyuan.tencentcloudapi.com/v2/ping
   ```

## Helper Tools

The codebase includes several tools to help diagnose and fix issues:

- **smoke-test-keys.js**: Tests API keys against provider endpoints
- **test-production-performance.js**: CI-friendly smoke test for production
- **fix-api-keys.js**: Interactive utility to fix common key issues

## Key Rotation Procedure

To rotate API keys:
1. Generate new key in Meshy/Hunyuan dashboard
2. Update GitHub Secret and hosting platform env var
3. Merge a no-op commit to trigger redeploy
4. Verify API is working
5. Revoke old key

## Common Problems & Solutions

| Problem | Symptom | Solution |
|---------|---------|----------|
| Edge runtime | Environment variables undefined | Set `export const runtime = 'nodejs'` |
| Whitespace in keys | Authentication failures | Trim keys with `.trim()` |
| Wrong region | Hunyuan returns 401 | Try alternative regions |
| CI/CD failures | Tests pass locally but fail in CI | Check GitHub secrets scope |
| Invalid key format | Invalid API key error | Check key format (msy_* or hy_*) |
| Outdated cache | Changes don't apply | Restart Next.js server |

## Safety Mechanisms

- GitHub secret scanning blocks accidental commits of API keys
- CI tests verify key presence and format
- Error sanitization prevents key leakage