# Backend API Specification

## Base URL Format

```
http(s)://host:port/chat-api
```

Examples:
- Development: `http://localhost:8080/chat-api`
- Production: `https://api.mercury-chat.com/chat-api`
- LAN: `http://192.168.1.100:8080/chat-api`

## Authentication

All API requests (except login endpoints) must include JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Response Format

All API responses follow this structure:

```typescript
{
  code: number,      // 0 for success, non-zero for errors
  message: string,   // Human-readable message
  data: any         // Response payload (null if error)
}
```

## Authentication Endpoints

### 1. Send Verification Code (SMS)

**Mock Implementation** - Replace when backend is ready

```
POST /chat-api/auth/verification-code/send
```

**Request:**
```json
{
  "phone": "13812345678",
  "type": "sms"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "验证码已发送",
  "data": {
    "expiresIn": 300
  }
}
```

**Notes:**
- Currently using mock implementation
- Real SMS integration needed for production
- Verification code expires in 5 minutes (300 seconds)

---

### 2. Login

**Real API Implementation**

```
POST /chat-api/auth/login
```

**Request:**
```json
{
  "method": "verification-code",
  "phone": "13812345678",
  "code": "123456"
}
```

OR

```json
{
  "method": "email",
  "email": "user@example.com",
  "code": "123456"
}
```

OR

```json
{
  "method": "wechat-official",
  "wechatToken": "WECHAT_AUTH_TOKEN"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_123",
      "username": "张三",
      "phone": "13812345678",
      "email": "user@example.com",
      "avatar": "https://cdn.example.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Error Response:**
```json
{
  "code": 1001,
  "message": "验证码错误或已过期",
  "data": null
}
```

---

### 3. Get WeChat QR Code

**Mock Implementation** - Replace when backend is ready

```
POST /chat-api/auth/wechat/qr-code
```

**Request:**
```json
{
  "type": "official"
}
```

OR

```json
{
  "type": "scan"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "qrUrl": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=TICKET",
    "ticket": "TICKET_ID_12345",
    "expiresIn": 120
  }
}
```

**Notes:**
- Currently using mock implementation
- QR code expires in 2 minutes (120 seconds)
- `type: 'official'` - Scan to follow official account and login
- `type: 'scan'` - Direct scan to login

---

### 4. Poll WeChat Scan Status

**Mock Implementation** - Replace when backend is ready

```
GET /chat-api/auth/wechat/scan-status?ticket=TICKET_ID
```

**Response (Not Scanned):**
```json
{
  "code": 0,
  "message": "等待扫码",
  "data": {
    "scanned": false,
    "confirmed": false
  }
}
```

**Response (Scanned, Not Confirmed):**
```json
{
  "code": 0,
  "message": "已扫码，等待确认",
  "data": {
    "scanned": true,
    "confirmed": false
  }
}
```

**Response (Confirmed - Login Success):**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "scanned": true,
    "confirmed": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_123",
      "username": "张三",
      "wechatUnionId": "UNIONID",
      "avatar": "https://cdn.example.com/avatar.jpg"
    }
  }
}
```

**Notes:**
- Frontend polls this endpoint every 2 seconds
- Stop polling when `confirmed: true` or QR code expires

---

### 5. Refresh Token

**Real API Implementation**

```
POST /chat-api/auth/token/refresh
```

**Request Headers:**
```
Authorization: Bearer <current-token>
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "Token刷新成功",
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

### 6. Logout

**Real API Implementation**

```
POST /chat-api/auth/logout
```

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:** (empty)

**Response:**
```json
{
  "code": 0,
  "message": "退出登录成功",
  "data": null
}
```

**Notes:**
- Backend should invalidate the token
- Frontend clears local storage

---

### 7. Get User Info

**Real API Implementation**

```
GET /chat-api/auth/user/info
```

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": "user_123",
    "username": "张三",
    "phone": "13812345678",
    "email": "user@example.com",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "role": "user"
  }
}
```

---

## Error Codes

| Code | Description | Action |
|------|-------------|--------|
| 0    | Success | - |
| 1001 | Invalid verification code | Show error message |
| 1002 | Verification code expired | Request new code |
| 1003 | Invalid credentials | Show error message |
| 1004 | User not found | Show error message |
| 1005 | Token expired | Refresh token or re-login |
| 1006 | Invalid token | Re-login |
| 2001 | Rate limit exceeded | Show cooldown message |
| 5000 | Internal server error | Show generic error |

## HTTP Status Codes

| Status | Description | Frontend Action |
|--------|-------------|-----------------|
| 200    | Success | Process response |
| 400    | Bad request | Show validation errors |
| 401    | Unauthorized | Auto-logout, show login modal |
| 403    | Forbidden | Show permission error |
| 429    | Too many requests | Show rate limit error |
| 500    | Server error | Show generic error |

## Chat Endpoints (Example)

### Send Message

```
POST /chat-api/chat/message
```

**Request Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Hello, AI!",
  "modelId": "gpt-4",
  "conversationId": "conv_123"
}
```

**Response:**
```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "messageId": "msg_456",
    "content": "Hello! How can I help you?",
    "conversationId": "conv_123",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Conversation History

```
GET /chat-api/chat/history?conversationId=conv_123&page=1&pageSize=20
```

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "messages": [
      {
        "id": "msg_456",
        "role": "user",
        "content": "Hello, AI!",
        "createdAt": "2024-01-01T00:00:00Z"
      },
      {
        "id": "msg_457",
        "role": "assistant",
        "content": "Hello! How can I help you?",
        "createdAt": "2024-01-01T00:00:01Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 20
  }
}
```

## Implementation Notes

### Token Lifecycle

1. **Login**: Backend generates JWT token with expiration (e.g., 24 hours)
2. **Storage**: Frontend stores in localStorage and Pinia store
3. **Usage**: Automatically added to all API request headers
4. **Refresh**: Before token expires, use refresh token to get new JWT
5. **Expiration**: On 401, frontend auto-logouts and shows login modal

### Security Recommendations

1. **Use HTTPS in production** - Prevent token interception
2. **Set reasonable token expiration** - Balance security and UX
3. **Implement refresh tokens** - Avoid frequent re-login
4. **Validate tokens on backend** - Check signature and expiration
5. **Rate limiting** - Prevent abuse (especially for SMS codes)
6. **CORS configuration** - Only allow trusted frontend origins

### Development Setup

1. Start backend server on `localhost:8080`
2. Configure frontend in `.env.local`:
   ```
   VITE_API_HOST=localhost
   VITE_API_PORT=8080
   VITE_API_PREFIX=chat-api
   VITE_API_USE_HTTPS=false
   ```
3. All requests will go to `http://localhost:8080/chat-api/...`

### Testing

Use curl or Postman to test endpoints:

```bash
# Login
curl -X POST http://localhost:8080/chat-api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"method":"verification-code","phone":"13812345678","code":"123456"}'

# Get user info (with token)
curl -X GET http://localhost:8080/chat-api/auth/user/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
