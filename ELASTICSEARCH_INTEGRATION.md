# Chat to Elasticsearch Integration

This document describes the Elasticsearch logging functionality added to the ChatPosInd application.

## Overview

The application now automatically sends chat data to an Elasticsearch database after retrieving responses from the chat API. This enables chat logging, analytics, and searchability for all chat interactions.

## Features

- **Automatic Logging**: Every chat exchange (user message + bot response) is automatically logged to Elasticsearch
- **Error Handling**: Failed Elasticsearch operations won't break the chat functionality
- **Flexible Authentication**: Supports both API key and basic authentication
- **Configurable**: All Elasticsearch settings can be configured via environment variables

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure the following variables:

```bash
# Required
NEXT_PUBLIC_ELASTICSEARCH_ENDPOINT=http://localhost:9200
NEXT_PUBLIC_ELASTICSEARCH_INDEX=chatposcx-logs

# Authentication (choose one)
NEXT_PUBLIC_ELASTICSEARCH_API_KEY=your-api-key-here
# OR
NEXT_PUBLIC_ELASTICSEARCH_USERNAME=your-username
NEXT_PUBLIC_ELASTICSEARCH_PASSWORD=your-password
```

### Document Structure

Each logged chat message has the following structure:

```json
{
  "role": "user|bot",
  "text": "message content",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "userId": "user-id",
  "sessionId": "session-id",
  "@timestamp": "2024-01-01T12:00:00.000Z",
  "indexedAt": "2024-01-01T12:00:00.000Z",
  "source": "chatposcx-frontend"
}
```

## API Endpoints

### `/api/run`
Handles chat message processing and returns bot responses in the expected format.

**Request:**
```json
{
  "appName": "multi_tool_agent",
  "userId": "user-123",
  "sessionId": "session-456",
  "newMessage": {
    "role": "user",
    "parts": [{"text": "Hello"}]
  }
}
```

**Response:**
```json
[
  {
    "content": {
      "role": "model",
      "parts": [{"text": "Hello! How can I help you?"}]
    },
    "invocationId": "e-1234567890",
    "author": "multi_tool_agent",
    "id": "abc123",
    "timestamp": 1640995200
  }
]
```

### `/api/proxy/[userId]/[sessionId]`
Creates or validates chat sessions.

**Response:**
```json
{
  "userId": "user-123",
  "id": "session-456",
  "created": "2024-01-01T12:00:00.000Z",
  "status": "active"
}
```

## Implementation Details

### Frontend Integration

The main chat component (`app/page.tsx`) includes:

1. **Elasticsearch Logger Initialization**: Creates an instance of the Elasticsearch logger on component mount
2. **Message Logging**: After each successful API response, both user and bot messages are sent to Elasticsearch
3. **Error Handling**: Elasticsearch failures are logged but don't interrupt the chat flow

### Key Functions

- `ElasticsearchLogger.logChatMessage()`: Logs a single message
- `ElasticsearchLogger.logChatExchange()`: Logs both user and bot messages from a conversation turn
- `getDefaultElasticsearchConfig()`: Retrieves configuration from environment variables

## Usage

### Normal Operation

1. User sends a message through the chat interface
2. Message is sent to `/api/run` for processing
3. Bot response is received and displayed
4. Both user message and bot response are automatically logged to Elasticsearch
5. Console logs confirm successful indexing

### Error Scenarios

- **Elasticsearch unavailable**: Chat continues normally, errors logged to console
- **Authentication failure**: Chat continues normally, errors logged to console
- **Network issues**: Chat continues normally, automatic retry logic could be added

## Testing

### Local Testing

1. Start a local Elasticsearch instance:
   ```bash
   docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0
   ```

2. Configure environment variables in `.env.local`

3. Start the application:
   ```bash
   npm run dev
   ```

4. Send test messages through the chat interface

5. Verify logs in Elasticsearch:
   ```bash
   curl -X GET "localhost:9200/chatposcx-logs/_search?pretty"
   ```

### Production Deployment

1. Set up Elasticsearch cluster (local or cloud-based like Elastic Cloud)
2. Configure authentication (API keys recommended)
3. Set production environment variables
4. Deploy application

## Security Considerations

- **API Keys**: Store in secure environment variables, never in code
- **Network**: Use HTTPS for production Elasticsearch endpoints
- **Authentication**: Prefer API keys over basic authentication
- **Index Access**: Configure appropriate read/write permissions for the chat logs index

## Monitoring

- Monitor Elasticsearch cluster health
- Set up alerts for logging failures
- Track chat volume and response times
- Monitor disk space usage for chat logs

## Future Enhancements

Potential improvements:
- Batch logging for better performance
- Retry logic for failed requests
- Chat analytics dashboard
- Search functionality for chat history
- Data retention policies
- Message encryption for sensitive data