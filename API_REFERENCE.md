# Venturr API Reference

**Version**: 2.0  
**Base URL**: `https://api.venturr.com/api/trpc`  
**Authentication**: JWT Bearer Token  

---

## Authentication

All API requests require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Get Current User

**Endpoint**: `auth.me`  
**Method**: Query  
**Authentication**: Required  

**Response**:
```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### Logout

**Endpoint**: `auth.logout`  
**Method**: Mutation  
**Authentication**: Required  

**Response**:
```json
{
  "success": true
}
```

---

## Organizations

### List Organizations

**Endpoint**: `organizations.list`  
**Method**: Query  
**Authentication**: Required  

**Response**:
```json
[
  {
    "id": "org-123",
    "name": "ABC Roofing",
    "subscriptionPlan": "pro",
    "subscriptionStatus": "active",
    "createdAt": "2025-01-10T10:00:00Z"
  }
]
```

### Create Organization

**Endpoint**: `organizations.create`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "name": "ABC Roofing"
}
```

**Response**:
```json
{
  "id": "org-123"
}
```

---

## Projects

### List Projects

**Endpoint**: `projects.list`  
**Method**: Query  
**Authentication**: Required  

**Input**:
```json
{
  "organizationId": "org-123"
}
```

**Response**:
```json
[
  {
    "id": "proj-123",
    "title": "Smith Residence",
    "address": "123 Main St, Sydney NSW 2000",
    "clientName": "John Smith",
    "status": "quoted",
    "propertyType": "residential",
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

### Get Project

**Endpoint**: `projects.get`  
**Method**: Query  
**Authentication**: Required  

**Input**:
```json
{
  "id": "proj-123"
}
```

**Response**:
```json
{
  "id": "proj-123",
  "title": "Smith Residence",
  "address": "123 Main St, Sydney NSW 2000",
  "clientName": "John Smith",
  "clientEmail": "john@example.com",
  "clientPhone": "+61412345678",
  "status": "quoted",
  "propertyType": "residential",
  "windRegion": "C",
  "balRating": "BAL-19",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### Create Project

**Endpoint**: `projects.create`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "organizationId": "org-123",
  "title": "Smith Residence",
  "address": "123 Main St, Sydney NSW 2000",
  "clientName": "John Smith",
  "clientEmail": "john@example.com",
  "clientPhone": "+61412345678",
  "propertyType": "residential"
}
```

**Response**:
```json
{
  "id": "proj-123"
}
```

### Update Project

**Endpoint**: `projects.update`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "id": "proj-123",
  "title": "Smith Residence - Updated",
  "status": "in_progress"
}
```

**Response**:
```json
{
  "success": true
}
```

### Delete Project

**Endpoint**: `projects.delete`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "id": "proj-123"
}
```

**Response**:
```json
{
  "success": true
}
```

---

## Measurements

### Create Measurement

**Endpoint**: `measurements.create`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "projectId": "proj-123",
  "address": "123 Main St, Sydney NSW 2000",
  "latitude": -33.8688,
  "longitude": 151.2093,
  "roofArea": 150.5,
  "measurementNotes": "Pitched roof, clear access"
}
```

**Response**:
```json
{
  "id": "meas-123",
  "projectId": "proj-123",
  "roofArea": 150.5,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### List Measurements

**Endpoint**: `measurements.list`  
**Method**: Query  
**Authentication**: Required  

**Input**:
```json
{
  "projectId": "proj-123"
}
```

**Response**:
```json
[
  {
    "id": "meas-123",
    "projectId": "proj-123",
    "roofArea": 150.5,
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

### Get Measurement

**Endpoint**: `measurements.get`  
**Method**: Query  
**Authentication**: Required  

**Input**:
```json
{
  "id": "meas-123"
}
```

**Response**:
```json
{
  "id": "meas-123",
  "projectId": "proj-123",
  "roofArea": 150.5,
  "measurementData": {...},
  "drawingData": {...},
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

## Takeoffs

### Create Takeoff

**Endpoint**: `takeoffs.create`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "projectId": "proj-123",
  "roofArea": "150.5",
  "roofType": "Colorbond",
  "roofPitch": "22.5",
  "wastePercentage": "10",
  "labourRate": "45",
  "profitMargin": "30",
  "materials": [
    {
      "materialId": "mat-123",
      "quantity": 200,
      "unit": "m"
    }
  ]
}
```

**Response**:
```json
{
  "id": "takeoff-123",
  "projectId": "proj-123",
  "subtotal": 5000,
  "labour": 1500,
  "total": 8050,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### List Takeoffs

**Endpoint**: `takeoffs.list`  
**Method**: Query  
**Authentication**: Required  

**Input**:
```json
{
  "projectId": "proj-123"
}
```

**Response**:
```json
[
  {
    "id": "takeoff-123",
    "projectId": "proj-123",
    "subtotal": 5000,
    "total": 8050,
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

---

## Quotes

### Create Quote

**Endpoint**: `quotes.create`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "projectId": "proj-123",
  "items": [
    {
      "description": "Colorbond Roofing Installation",
      "quantity": 200,
      "unit": "m",
      "unitPrice": 25
    }
  ],
  "terms": "50% deposit required",
  "notes": "Includes guttering",
  "validUntil": "2025-02-15T00:00:00Z"
}
```

**Response**:
```json
{
  "id": "quote-123",
  "projectId": "proj-123",
  "quoteNumber": "QT-001",
  "subtotal": 5000,
  "gst": 500,
  "total": 5500,
  "status": "draft",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### List Quotes

**Endpoint**: `quotes.list`  
**Method**: Query  
**Authentication**: Required  

**Input**:
```json
{
  "projectId": "proj-123"
}
```

**Response**:
```json
[
  {
    "id": "quote-123",
    "projectId": "proj-123",
    "quoteNumber": "QT-001",
    "total": 5500,
    "status": "draft",
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

### Get Quote

**Endpoint**: `quotes.get`  
**Method**: Query  
**Authentication**: Required  

**Input**:
```json
{
  "id": "quote-123"
}
```

**Response**:
```json
{
  "id": "quote-123",
  "projectId": "proj-123",
  "quoteNumber": "QT-001",
  "items": [...],
  "subtotal": 5000,
  "gst": 500,
  "total": 5500,
  "status": "draft",
  "terms": "50% deposit required",
  "notes": "Includes guttering",
  "validUntil": "2025-02-15T00:00:00Z",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### Update Quote

**Endpoint**: `quotes.update`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "id": "quote-123",
  "status": "sent",
  "items": [...]
}
```

**Response**:
```json
{
  "success": true
}
```

### Send Quote

**Endpoint**: `quotes.send`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "quoteId": "quote-123",
  "recipientEmail": "john@example.com",
  "message": "Please review the attached quote"
}
```

**Response**:
```json
{
  "success": true,
  "sentAt": "2025-01-15T10:00:00Z"
}
```

---

## Clients

### List Clients

**Endpoint**: `clients.list`  
**Method**: Query  
**Authentication**: Required  

**Input**:
```json
{
  "organizationId": "org-123"
}
```

**Response**:
```json
[
  {
    "id": "client-123",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+61412345678",
    "address": "123 Main St, Sydney NSW 2000",
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

### Create Client

**Endpoint**: `clients.create`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "organizationId": "org-123",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+61412345678",
  "address": "123 Main St, Sydney NSW 2000"
}
```

**Response**:
```json
{
  "id": "client-123"
}
```

### Get Client

**Endpoint**: `clients.get`  
**Method**: Query  
**Authentication**: Required  

**Input**:
```json
{
  "id": "client-123"
}
```

**Response**:
```json
{
  "id": "client-123",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+61412345678",
  "address": "123 Main St, Sydney NSW 2000",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### Update Client

**Endpoint**: `clients.update`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "id": "client-123",
  "phone": "+61412345679"
}
```

**Response**:
```json
{
  "success": true
}
```

### Delete Client

**Endpoint**: `clients.delete`  
**Method**: Mutation  
**Authentication**: Required  

**Input**:
```json
{
  "id": "client-123"
}
```

**Response**:
```json
{
  "success": true
}
```

---

## Error Handling

All API errors follow this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "User is not authenticated",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | User is not authenticated |
| FORBIDDEN | 403 | User lacks permissions |
| NOT_FOUND | 404 | Resource not found |
| BAD_REQUEST | 400 | Invalid input |
| CONFLICT | 409 | Resource already exists |
| INTERNAL_SERVER_ERROR | 500 | Server error |
| PAYMENT_REQUIRED | 402 | Payment failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |

---

## Rate Limiting

API requests are rate limited to 100 requests per 15 minutes per IP address.

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

---

## Pagination

List endpoints support pagination:

**Query Parameters**:
- `limit` (default: 20, max: 100)
- `offset` (default: 0)

**Example**:
```
GET /api/trpc/projects.list?input={"organizationId":"org-123","limit":50,"offset":0}
```

---

## Webhooks

Webhooks are available for the following events:

- `project.created`
- `project.updated`
- `quote.sent`
- `quote.accepted`
- `payment.completed`
- `subscription.changed`

**Webhook Format**:
```json
{
  "event": "project.created",
  "timestamp": "2025-01-15T10:00:00Z",
  "data": {
    "id": "proj-123",
    "title": "Smith Residence"
  }
}
```

---

## SDK & Client Libraries

### JavaScript/TypeScript

```typescript
import { trpc } from "@venturr/client";

// Get current user
const user = await trpc.auth.me.query();

// Create project
const project = await trpc.projects.create.mutate({
  organizationId: "org-123",
  title: "Smith Residence",
  address: "123 Main St, Sydney NSW 2000"
});

// List projects
const projects = await trpc.projects.list.query({
  organizationId: "org-123"
});
```

### Python

```python
from venturr import VenturrClient

client = VenturrClient(api_key="your-api-key")

# Get current user
user = client.auth.me()

# Create project
project = client.projects.create(
    organization_id="org-123",
    title="Smith Residence",
    address="123 Main St, Sydney NSW 2000"
)

# List projects
projects = client.projects.list(organization_id="org-123")
```

---

## Support

For API support, contact:
- **Email**: api-support@venturr.com
- **Documentation**: https://docs.venturr.com
- **Status**: https://status.venturr.com

---

**API Version**: 2.0  
**Last Updated**: October 30, 2025  
**Status**: PRODUCTION READY

