// Test script to verify Elasticsearch functionality
import { ElasticsearchLogger, getDefaultElasticsearchConfig, type ChatMessage } from '../lib/elasticsearch'

async function testElasticsearchLogging() {
  console.log('Testing Elasticsearch logging functionality...')
  
  // Test configuration
  const testConfig = {
    endpoint: 'http://localhost:9200',
    index: 'chatposcx-test-logs',
    // No authentication for local testing
  }
  
  try {
    const logger = new ElasticsearchLogger(testConfig)
    
    // Test message
    const testUserMessage: ChatMessage = {
      role: 'user',
      text: 'Hello, this is a test message',
      timestamp: new Date().toISOString(),
      userId: 'test-user-123',
      sessionId: 'test-session-456'
    }
    
    const testBotResponse: ChatMessage = {
      role: 'bot',
      text: 'Hello! This is a test response from the bot.',
      timestamp: new Date().toISOString(),
      userId: 'test-user-123',
      sessionId: 'test-session-456'
    }
    
    console.log('Attempting to log test messages...')
    
    // Test individual message logging
    const userLogResult = await logger.logChatMessage(testUserMessage)
    console.log('User message logged:', userLogResult)
    
    const botLogResult = await logger.logChatMessage(testBotResponse)
    console.log('Bot response logged:', botLogResult)
    
    // Test exchange logging
    const exchangeResult = await logger.logChatExchange(testUserMessage, testBotResponse)
    console.log('Chat exchange logged:', exchangeResult)
    
    console.log('Test completed successfully!')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testElasticsearchLogging()
}

export { testElasticsearchLogging }