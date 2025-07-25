// Elasticsearch utility for frontend chat logging
export interface ChatMessage {
  role: 'user' | 'bot'
  text: string
  timestamp: string
  userId?: string
  sessionId?: string
}

export interface ElasticsearchConfig {
  endpoint: string
  index: string
  apiKey?: string
  username?: string
  password?: string
}

export class ElasticsearchLogger {
  private config: ElasticsearchConfig

  constructor(config: ElasticsearchConfig) {
    this.config = config
  }

  async logChatMessage(message: ChatMessage): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Add authentication headers if provided
      if (this.config.apiKey) {
        headers['Authorization'] = `ApiKey ${this.config.apiKey}`
      } else if (this.config.username && this.config.password) {
        const auth = btoa(`${this.config.username}:${this.config.password}`)
        headers['Authorization'] = `Basic ${auth}`
      }

      // Create document with timestamp and additional metadata
      const document = {
        ...message,
        '@timestamp': new Date().toISOString(),
        indexedAt: new Date().toISOString(),
        source: 'chatposcx-frontend'
      }

      const response = await fetch(`${this.config.endpoint}/${this.config.index}/_doc`, {
        method: 'POST',
        headers,
        body: JSON.stringify(document),
      })

      if (!response.ok) {
        console.error('Failed to index document to Elasticsearch:', response.statusText)
        return false
      }

      const result = await response.json()
      console.log('Successfully indexed chat message to Elasticsearch:', result._id)
      return true
    } catch (error) {
      console.error('Error sending data to Elasticsearch:', error)
      return false
    }
  }

  async logChatExchange(userMessage: ChatMessage, botResponse: ChatMessage): Promise<boolean> {
    try {
      // Log both messages in sequence
      const userLogSuccess = await this.logChatMessage(userMessage)
      const botLogSuccess = await this.logChatMessage(botResponse)
      
      return userLogSuccess && botLogSuccess
    } catch (error) {
      console.error('Error logging chat exchange:', error)
      return false
    }
  }
}

// Default configuration - can be overridden via environment variables or props
export const getDefaultElasticsearchConfig = (): ElasticsearchConfig => {
  return {
    endpoint: process.env.NEXT_PUBLIC_ELASTICSEARCH_ENDPOINT || 'http://localhost:9200',
    index: process.env.NEXT_PUBLIC_ELASTICSEARCH_INDEX || 'chatposcx-logs',
    apiKey: process.env.NEXT_PUBLIC_ELASTICSEARCH_API_KEY,
    username: process.env.NEXT_PUBLIC_ELASTICSEARCH_USERNAME,
    password: process.env.NEXT_PUBLIC_ELASTICSEARCH_PASSWORD,
  }
}