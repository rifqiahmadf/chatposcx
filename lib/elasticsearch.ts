import { Client } from '@elastic/elasticsearch'

// Elasticsearch configuration
const ELASTICSEARCH_CONFIG = {
    node: 'http://10.24.1.43:1200',
    auth: {
        username: 'elastic',
        password: 'infini_rag_flow'
    },
    // Add SSL configuration if needed
    tls: {
        rejectUnauthorized: false // Set to true in production with proper certificates
    }
}

// Create Elasticsearch client instance
let client: Client | null = null

export function getElasticsearchClient(): Client {
    if (!client) {
        client = new Client(ELASTICSEARCH_CONFIG)
    }
    return client
}

// Interface for API response data to be stored in Elasticsearch
export interface ApiResponseData {
    timestamp: string
    endpoint: string
    method: string
    requestData: any
    responseData: any
    userId?: string
    sessionId?: string
    appName?: string
    responseTime?: number
    statusCode: number
}

// Index name for storing API responses
const API_RESPONSES_INDEX = 'chatposcx-api-responses'

// Create index if it doesn't exist
export async function ensureIndexExists() {
    const client = getElasticsearchClient()

    try {
        const indexExists = await client.indices.exists({
            index: API_RESPONSES_INDEX
        })

        if (!indexExists) {
            // Use the proper API for Elasticsearch version 8
            await client.indices.create({
                index: API_RESPONSES_INDEX,
                body: {
                    mappings: {
                        properties: {
                            timestamp: { type: 'date' },
                            endpoint: { type: 'keyword' },
                            method: { type: 'keyword' },
                            requestData: { type: 'object' },
                            responseData: { type: 'object' },
                            userId: { type: 'keyword' },
                            sessionId: { type: 'keyword' },
                            appName: { type: 'keyword' },
                            responseTime: { type: 'integer' },
                            statusCode: { type: 'integer' }
                        }
                    }
                }
            })
            console.log(`Created Elasticsearch index: ${API_RESPONSES_INDEX}`)
        }
    } catch (error) {
        console.error('Error creating Elasticsearch index:', error)
        // Don't throw error, let the app continue
    }
}

// Save API response to Elasticsearch
export async function saveApiResponse(data: ApiResponseData) {
    const client = getElasticsearchClient()

    try {
        // Ensure index exists
        await ensureIndexExists()

        // Index the document
        const response = await client.index({
            index: API_RESPONSES_INDEX,
            body: {
                ...data,
                '@timestamp': new Date().toISOString()
            }
        })

        console.log('API response saved to Elasticsearch:', response._id)
        return response
    } catch (error) {
        console.error('Error saving API response to Elasticsearch:', error)
        // Don't throw error to prevent API from failing
        // Just log it and continue
    }
}

// Search API responses in Elasticsearch
export async function searchApiResponses(query: any = {}) {
    const client = getElasticsearchClient()

    try {
        // Simple search without complex query structure for now
        const response = await client.search({
            index: API_RESPONSES_INDEX,
            body: {
                sort: [{ timestamp: { order: 'desc' } }],
                size: query.size || 100
            }
        })

        return response.hits.hits.map((hit: any) => ({
            id: hit._id,
            ...(hit._source || {})
        }))
    } catch (error) {
        console.error('Error searching API responses in Elasticsearch:', error)
        throw error
    }
}// Test Elasticsearch connection
export async function testElasticsearchConnection() {
    const client = getElasticsearchClient()

    try {
        const response = await client.ping()
        console.log('Elasticsearch connection successful')
        return true
    } catch (error) {
        console.error('Elasticsearch connection failed:', error)
        return false
    }
}
