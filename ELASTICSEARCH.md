# Elasticsearch Integration - /api/run Logging Only

This application includes Elasticsearch integration specifically configured to log **only** API responses from the `/api/run` endpoint.

## Configuration

The Elasticsearch connection is configured in `lib/elasticsearch.ts` with the following settings:

- **URL**: `http://10.24.1.43:1200`
- **Username**: `elastic`
- **Password**: `infini_rag_flow`

## Features

### 1. Selective API Response Logging

**ONLY** the `/api/run` endpoint responses are logged to Elasticsearch. All other API endpoints are excluded from logging.

The logged information includes:

- **Timestamp**: When the request was made
- **Endpoint**: Always `/api/run`
- **Method**: HTTP method (typically POST)
- **Request Data**: The complete request payload sent to `/api/run`
- **Response Data**: The complete response payload from the proxied service
- **User ID**: Extracted from request data (if available)
- **Session ID**: Extracted from request data (if available)
- **App Name**: Extracted from request data (if available)
- **Response Time**: How long the request took to process
- **Status Code**: HTTP status code of the response

### 2. Proxy Functionality

The `/api/run` endpoint acts as a proxy to `http://10.24.1.43:5001/run` while logging all requests and responses.

### 2. Elasticsearch Index

All data is stored in the `chatposcx-api-responses` index with proper mappings for efficient querying.

### 3. API Endpoints

#### Test Connection: `/api/elasticsearch?action=test`

```bash
GET /api/elasticsearch?action=test
```

Tests the Elasticsearch connection and returns connection status.

#### Search Logs: `/api/logs`

```bash
GET /api/logs?limit=50&userId=user123&sessionId=session456
```

Query parameters:

- `limit`: Number of records to return (default: 50)
- `userId`: Filter by user ID
- `sessionId`: Filter by session ID
- `endpoint`: Filter by endpoint
- `from`: Start date (ISO format)
- `to`: End date (ISO format)

### 4. Dashboard

Visit `/logs` to access the web-based dashboard where you can:

- View all API logs in a paginated format
- Filter logs by user ID, session ID, endpoint, and date range
- See request/response summaries
- Monitor response times and status codes
- Check Elasticsearch connection status

## Usage

### For Existing APIs

The chat API (`/api/chat`) is already configured to log all requests and responses automatically.

### For New APIs

To add Elasticsearch logging to new API endpoints, use the middleware wrapper:

```typescript
import { withElasticsearchLogging } from "@/lib/elasticsearch-middleware";

async function handlePost(request: NextRequest) {
  // Your API logic here
  return NextResponse.json({ message: "Success" });
}

// Export the wrapped handler
export const POST = withElasticsearchLogging(handlePost, "/api/your-endpoint");
```

### Manual Logging

For custom logging scenarios, use the utility function:

```typescript
import { logApiResponse } from "@/lib/elasticsearch-middleware";

// In your API handler
await logApiResponse(request, requestData, responseData, statusCode, startTime);
```

## Files Structure

```
lib/
├── elasticsearch.ts           # Core Elasticsearch client and functions
├── elasticsearch-middleware.ts # Middleware for automatic logging
├── elasticsearch-init.ts       # Initialization script
└── utils.ts                   # Existing utilities

app/
├── api/
│   ├── chat/route.ts          # Chat API with Elasticsearch logging
│   ├── elasticsearch/route.ts # Elasticsearch management API
│   └── logs/route.ts          # Logs retrieval API
└── logs/page.tsx              # Dashboard page
```

## Monitoring

The system includes:

1. **Connection Testing**: Automatic connection testing on app startup
2. **Error Handling**: Graceful error handling that won't break your APIs
3. **Index Management**: Automatic index creation with proper mappings
4. **Dashboard**: Real-time monitoring interface

## Error Handling

The Elasticsearch integration is designed to be non-blocking:

- If Elasticsearch is unavailable, APIs will continue to work normally
- Logging errors are logged to console but don't affect API responses
- Connection issues are automatically detected and reported

## Security Notes

- The current configuration uses HTTP with basic authentication
- For production, consider using HTTPS and proper certificate validation
- The password is currently hardcoded - consider using environment variables

## Troubleshooting

1. **Connection Issues**: Check the `/api/elasticsearch?action=test` endpoint
2. **Missing Logs**: Verify the index exists and has proper mappings
3. **Dashboard Issues**: Check browser console for JavaScript errors
4. **Performance**: Monitor Elasticsearch cluster health and disk space

## Customization

You can customize the logging behavior by modifying:

- `lib/elasticsearch.ts`: Core configuration and functions
- `lib/elasticsearch-middleware.ts`: Middleware behavior
- Index mappings and data structure
- Dashboard filters and display options
