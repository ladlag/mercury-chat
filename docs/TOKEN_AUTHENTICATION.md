# Token-Based Backend Integration

## Overview

This document describes how the Mercury Chat frontend integrates with the backend using token-based authentication (JWT).

## Authentication Flow

### 1. Login Process

```
User Login → Frontend sends credentials → Backend validates → Returns JWT token → Frontend stores token
```

#### API Endpoints

**Send Verification Code**
```
POST /api/auth/send-code
Body: { phone: string }
Response: { code: 0, message: string, data: null }
```

**Login**
```
POST /api/auth/login
Body: {
  method: 'verification-code' | 'email' | 'wechat-official' | 'wechat-scan',
  phone?: string,
  email?: string,
  code?: string,
  wechatToken?: string
}
Response: {
  code: 0,
  message: string,
  data: {
    token: string,        // JWT token
    user: {
      id: string,
      username: string,
      email?: string,
      phone?: string,
      avatar?: string,
      createdAt: Date
    }
  }
}
```

### 2. Token Storage

Tokens are stored in:
- **Pinia Store**: `useAuthStore().token` (in-memory, reactive)
- **localStorage**: `auth-token` (persistent across sessions)

### 3. Authenticated Requests

All API requests automatically include the JWT token in the Authorization header:

```typescript
import { useHttp } from '@/hooks/useHttp';

const { get, post } = useHttp();

// Token is automatically added to headers
const response = await get('/api/user/profile');
const response = await post('/api/chat/message', { content: 'Hello' });
```

#### HTTP Headers

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### 4. Token Refresh

When a token is about to expire, call the refresh endpoint:

```
POST /api/auth/refresh-token
Body: { refreshToken: string }
Response: {
  code: 0,
  data: {
    token: string  // New JWT token
  }
}
```

The frontend automatically:
- Stores the new token
- Retries the failed request with the new token

### 5. Token Expiration

When a token expires (401 response):
1. Frontend detects 401 status code
2. Automatically logs out the user
3. Clears stored tokens
4. Shows login modal if `requireLogin` is enabled

## Backend API Requirements

### Expected Response Format

All API responses should follow this format:

```typescript
{
  code: number,      // 0 for success, non-zero for errors
  message: string,   // Human-readable message
  data: any         // Response payload
}
```

### Status Codes

- `200`: Success
- `401`: Unauthorized (token invalid/expired)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Server error

## Usage Examples

### Making Authenticated Requests

```typescript
// In a component or composable
import { useHttp } from '@/hooks/useHttp';

const { get, post } = useHttp();

// Get user profile
const getUserProfile = async () => {
  try {
    const response = await get('/api/user/profile');
    if (response.code === 0) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to get profile:', error);
  }
};

// Send chat message
const sendMessage = async (content: string) => {
  try {
    const response = await post('/api/chat/message', {
      content,
      modelId: 'gpt-4'
    });
    if (response.code === 0) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
```

### Direct HTTP Client Usage

```typescript
import httpClient from '@/utils/http-client';

// Custom configuration
const response = await httpClient.get('/api/data', {
  timeout: 30000,  // 30 second timeout
  baseURL: 'https://api.example.com'
});
```

### File Upload with Token

```typescript
import { useHttp } from '@/hooks/useHttp';

const { upload } = useHttp();

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await upload('/api/upload', formData);
  return response.data.url;
};
```

## Security Considerations

### Token Storage

- ✅ **DO**: Store tokens in memory (Pinia store) for active sessions
- ✅ **DO**: Use localStorage for persistence (acceptable for public applications)
- ⚠️ **CONSIDER**: For high-security apps, use httpOnly cookies instead
- ❌ **DON'T**: Store tokens in sessionStorage (clears on tab close)
- ❌ **DON'T**: Expose tokens in URLs or logs

### Token Transmission

- ✅ Always use HTTPS in production
- ✅ Token is sent in Authorization header (not in URL)
- ✅ Automatic logout on 401 responses

### Token Validation

Backend should:
- Validate JWT signature
- Check token expiration
- Verify user permissions
- Invalidate tokens on logout

## Configuration

### API Base URL

Configure in `src/utils/http-client.ts`:

```typescript
const httpClient = new HttpClient('/api', 10000);
//                                 ^^^^   ^^^^^^
//                                 baseURL timeout
```

For production, set via environment variable:

```typescript
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
```

### Request Timeout

Default: 10 seconds (10000ms)

Adjust per request:
```typescript
await get('/api/long-running', { timeout: 60000 }); // 60 seconds
```

## Error Handling

### Common Error Scenarios

1. **Network Error**
   ```typescript
   try {
     await post('/api/endpoint', data);
   } catch (error) {
     if (error.message === 'Request timeout') {
       // Handle timeout
     }
   }
   ```

2. **Authentication Error (401)**
   - Automatically handled by HTTP client
   - User is logged out
   - Login modal is shown

3. **Validation Error (400)**
   ```typescript
   const response = await post('/api/endpoint', data);
   if (response.code !== 0) {
     console.error(response.message); // Show to user
   }
   ```

## Testing

### Mock Mode

For development without backend, use mock mode in auth adapter:

```typescript
// Set in environment or config
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
```

### API Testing

Test authenticated endpoints with:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     https://api.example.com/api/user/profile
```

## Migration from Mock to Real API

1. ✅ Update `AuthAdapter` methods to call real endpoints
2. ✅ Configure correct API base URL
3. ✅ Test login flow
4. ✅ Test token refresh
5. ✅ Test 401 handling
6. ✅ Update error messages
7. ✅ Remove mock data

## Support

For API integration issues:
1. Check browser network tab for request/response
2. Verify token in Authorization header
3. Check API endpoint matches backend routes
4. Verify response format matches expected structure
