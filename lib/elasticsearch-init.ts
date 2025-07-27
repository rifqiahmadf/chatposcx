import { testElasticsearchConnection, ensureIndexExists } from './elasticsearch'

// Initialize Elasticsearch connection and indices
export async function initializeElasticsearch() {
    try {
        console.log('Initializing Elasticsearch for /api/run logging...')

        // Test connection
        const isConnected = await testElasticsearchConnection()
        if (!isConnected) {
            console.warn('Elasticsearch connection failed. /api/run logging will be disabled.')
            return false
        }

        // Ensure indices exist
        await ensureIndexExists()

        console.log('Elasticsearch initialized successfully - only /api/run requests will be logged')
        return true
    } catch (error) {
        console.error('Failed to initialize Elasticsearch:', error)
        return false
    }
}

// Call this function when the app starts
initializeElasticsearch()
